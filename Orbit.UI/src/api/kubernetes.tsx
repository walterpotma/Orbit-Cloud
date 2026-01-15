import { axiosInstance } from "./config";

const controller = "kubernetes";

export class Pods {
    static List(namespace?: string) {
        return axiosInstance.get(`${controller}/pods/${namespace || ""}`, { withCredentials: true });
    }
}

export class Deployments {
    static List(namespace?: string) {
        console.log("Fetching deployments for namespace:", namespace);
        return axiosInstance.get(`${controller}/deployments/u-${namespace || ""}`, { withCredentials: true });
    }
}

export class Namespaces {
    static List(namespace: string) {
        return axiosInstance.get(`${controller}/namespaces/u-${namespace}`, { withCredentials: true });
    }

    static Metrics(namespace: string) {
        return axiosInstance.get(`${controller}/namespaces/metrics/u-${namespace}`, { withCredentials: true });
    }
}