import { axiosInstance } from "../libs/axios";

const controller = "kubernetes";

export class Pods {
    static List(namespace?: string) {
        return axiosInstance.get(`${controller}/pods/${namespace || ""}`, { withCredentials: true });
    }
}