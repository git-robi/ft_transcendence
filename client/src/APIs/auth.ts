import axios from "axios"
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

//this is creating an axios instance
export default axios.create({ 
    baseURL: API_BASE_URL + "/api/v1/auth"

});
