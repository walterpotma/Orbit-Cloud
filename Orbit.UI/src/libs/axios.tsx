import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://api.orbitcloud.com.br/",
    headers: {
        'Content-Type': 'application/json'
    }
})