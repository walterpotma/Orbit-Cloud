import { axiosInstance } from "@/libs/axios";

const controller = "kubernetes";

export class Secrets {
    static List(namespace?: string) {
        return axiosInstance.get(`${controller}/secrets/u-${namespace || ""}`, { withCredentials: true });
    }
}