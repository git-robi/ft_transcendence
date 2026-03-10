import axios from "axios"
import { attachCsrfInterceptor } from "./csrf";
const AUTH_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const client = axios.create({
    baseURL: AUTH_BASE_URL + "/friends",
    withCredentials: true
});
attachCsrfInterceptor(client);

export default client;
