import { axiosInstance } from "./config";

const controller = "kubernetes";

export class Pods {
    static List(namespace?: string) {
        return axiosInstance.get(`${controller}/pods/${namespace || ""}`, { withCredentials: true });
    }
}

export class Deployments {
    static List(namespace?: string) {
        return axiosInstance.get(`${controller}/deployments/${namespace || ""}`, { withCredentials: true });
    }
}