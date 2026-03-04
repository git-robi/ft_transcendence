import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const SAFE_METHODS = new Set(["get", "head", "options"]);

let csrfToken: string | null = null;
let csrfTokenRequest: Promise<string> | null = null;

const fetchCsrfToken = async (): Promise<string> => {
    const response = await axios.get<{ csrfToken: string }>(`${API_BASE_URL}/auth/csrf-token`, {
        withCredentials: true,
    });

    const token = response.data?.csrfToken;
    if (!token) {
        throw new Error("Missing CSRF token");
    }

    csrfToken = token;
    return token;
};

const getCsrfToken = async (): Promise<string> => {
    if (csrfToken) return csrfToken;

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
