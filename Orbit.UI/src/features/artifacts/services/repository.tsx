import { axiosInstance } from "@/libs/axios";

const controller = "github";

export class Repository {
    static List(installationId: number | null) {
        return axiosInstance.get(`${controller}/repos/${installationId}`, { withCredentials: true });
    }
}