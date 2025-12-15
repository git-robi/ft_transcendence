import axios from "axios"

//this is creating an axios instance
export default axios.create({ 
    baseURL: "http://localhost:3001/api/v1/auth" 
});