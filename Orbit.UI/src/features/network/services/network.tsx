import { axiosInstance } from "@/libs/axios";

const controller = "kubernetes";

export class Services {
    static List(namespace?: string) {
        return axiosInstance.get(`${controller}/services/u-${namespace || ""}`, { withCredentials: true });
    }
}

export class Ingress {
    static List(namespace?: string) {
        return axiosInstance.get(`${controller}/ingress/u-${namespace || ""}`, { withCredentials: true });
    }
}