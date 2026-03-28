import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const CSRF_COOKIE_NAME = "csrf_token";
const SAFE_METHODS = new Set(["get", "head", "options"]);

const readCsrfCookie = (): string | null => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
};

let csrfTokenRequest: Promise<string> | null = null;

const fetchCsrfToken = async (): Promise<string> => {
    const response = await axios.get<{ csrfToken: string }>(`${API_BASE_URL}/auth/csrf-token`, {
        withCredentials: true,
    });

    const token = response.data?.csrfToken;
    if (!token) {
        throw new Error("Missing CSRF token");
    }

    return token;
};

export const getCsrfToken = async (): Promise<string> => {
    const cookieToken = readCsrfCookie();
    if (cookieToken) return cookieToken;

    if (!csrfTokenRequest) {
        csrfTokenRequest = fetchCsrfToken().finally(() => {
            csrfTokenRequest = null;
        });
    }

    return csrfTokenRequest;
};

const shouldAttachCsrf = (config: InternalAxiosRequestConfig): boolean => {
    const method = (config.method || "get").toLowerCase();
    if (SAFE_METHODS.has(method)) return false;

    const url = config.url || "";
    return !url.endsWith("/csrf-token");
};

export const attachCsrfInterceptor = (client: AxiosInstance): AxiosInstance => {
    client.defaults.withCredentials = true;

    client.interceptors.request.use(async (config) => {
        if (!shouldAttachCsrf(config)) {
            return config;
        }

        const token = await getCsrfToken();
        if (config.headers && typeof (config.headers as { set?: unknown }).set === "function") {
            (config.headers as { set: (name: string, value: string) => void }).set(CSRF_HEADER_NAME, token);
        } else {
            config.headers = {
                ...(config.headers || {}),
                [CSRF_HEADER_NAME]: token,
            };
        }
        return config;
    });

    return client;
};
