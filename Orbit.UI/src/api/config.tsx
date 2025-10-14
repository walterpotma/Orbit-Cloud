import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:32769/Api",
    headers: {
        'Content-Type': 'application/json'
    }
})