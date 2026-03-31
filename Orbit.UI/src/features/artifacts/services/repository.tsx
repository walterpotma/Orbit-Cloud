import { axiosInstance } from "@/libs/axios";

const controller = "github";

export class Repository {
    static List(githubAppId: string) {
        return axiosInstance.get(`${controller}/repos/${githubAppId}`, { withCredentials: true });
    }
}