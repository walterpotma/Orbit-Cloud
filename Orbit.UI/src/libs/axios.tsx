import axios from "axios";
import { VARIABLE_API_URL } from "@/types/variables";

export const axiosInstance = axios.create({
    baseURL: VARIABLE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})