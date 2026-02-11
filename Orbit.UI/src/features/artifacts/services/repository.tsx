import { axiosInstance } from "@/libs/axios";

const controller = "github/";

export class Repository {
    static List() {
        return axiosInstance.get(`${controller}/repos`, { withCredentials: true });
    }
}