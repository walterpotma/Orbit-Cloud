import { axiosInstance } from "@/libs/axios";

const controller = "prometheus";

export class Prometheus {
    static CPU(namespace: string) {
        return axiosInstance.get(`${controller}/cpu/u-${namespace}`, { withCredentials: true });
    }

    static Memory(namespace: string) {
        return axiosInstance.get(`${controller}/memory/u-${namespace}`, { withCredentials: true });
    }
}