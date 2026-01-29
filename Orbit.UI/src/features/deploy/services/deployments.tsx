"use client";

import { axiosInstance } from "@/libs/axios";

const controller = "kubernetes";

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