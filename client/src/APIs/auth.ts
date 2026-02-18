import axios from "axios"
const AUTH_BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

// Create axios instance (uses relative /api/v1 in dev so Vite can proxy)
export default axios.create({
  baseURL: AUTH_BASE_URL + "/auth",
  withCredentials: true,
});
