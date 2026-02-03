import { axiosInstance } from "@/libs/axios";

const controller = "registry";

export class Registry {
    static List(githubID: string) {
        return axiosInstance.get(`${controller}/user?githubId=${githubID}`, { withCredentials: true });
    }
}