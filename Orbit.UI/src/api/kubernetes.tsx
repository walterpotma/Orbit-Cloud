import { axiosInstance } from "./config";

const controller = "kubernetes";

export class Pods {
    static List() {
        return axiosInstance.get(`${controller}/pods`, { withCredentials: true });
    }
}

export class Deployments {
    static List() {
        return axiosInstance.get(`${controller}/deployments`, { withCredentials: true });
    }
}