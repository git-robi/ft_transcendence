import axios from "axios"
import { attachCsrfInterceptor } from "./csrf";
const AUTH_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const profileClient = axios.create({
    baseURL: AUTH_BASE_URL + "/profile",
});

attachCsrfInterceptor(profileClient);

export default profileClient;
