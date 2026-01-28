import { axiosInstance } from "../libs/axios";

const controller = "/github";

export class Github {
    static Login() {
        window.location.href = `${axiosInstance.defaults.baseURL}${controller}/login`;
    }

    static Me() {
        return axiosInstance.get(`${controller}/me`, { withCredentials: true });
    }
}
