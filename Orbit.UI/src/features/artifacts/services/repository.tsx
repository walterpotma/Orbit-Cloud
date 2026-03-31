import { axiosInstance } from "@/libs/axios";

const controller = "github";

export class Repository {
    static List(githubAppId: number | 0) {
        return axiosInstance.get(`${controller}/repos/${githubAppId}`, { withCredentials: true });
    }
}