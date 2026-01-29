import { axiosInstance } from "@/libs/axios";

const controller = "kubernetes";

export class Namespaces {
    static List(namespace: string) {
        return axiosInstance.get(`${controller}/namespace/u-${namespace}`, { withCredentials: true });
    }

    static Metrics(namespace: string) {
        return axiosInstance.get(`${controller}/namespace/u-${namespace}/metrics`, { withCredentials: true });
    }
}