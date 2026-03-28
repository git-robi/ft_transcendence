import axios from "axios"
import { attachCsrfInterceptor } from "./csrf";
const AUTH_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const authClient = axios.create({
    baseURL: AUTH_BASE_URL + "/auth"
});

attachCsrfInterceptor(authClient);

export default authClient;
