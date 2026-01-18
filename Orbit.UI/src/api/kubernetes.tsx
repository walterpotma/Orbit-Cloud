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
        static Create(namespace: string, deploymentData: any) {
            return axiosInstance.post(`${controller}/deployments/u-${namespace}`, { 
                name: deploymentData.name,
                image: deploymentData.image,
                tag: deploymentData.tag,
                port: Number(deploymentData.port),
                replicas: Number(deploymentData.replicas),
                subdomain: deploymentData.subdomain
            }, { withCredentials: true });
        }
    }

export class Namespaces {
    static List(namespace: string) {
        return axiosInstance.get(`${controller}/namespace/u-${namespace}`, { withCredentials: true });
    }

    static Metrics(namespace: string) {
        return axiosInstance.get(`${controller}/namespace/u-${namespace}/metrics`, { withCredentials: true });
    }
}

export class Services {
    static List(namespace?: string) {
        return axiosInstance.get(`${controller}/services/u-${namespace || "201145284"}`, { withCredentials: true });
    }
}

export class Ingress {
    static List(namespace?: string) {
        return axiosInstance.get(`${controller}/ingress/u-${namespace || "201145284"}`, { withCredentials: true });
    }
}