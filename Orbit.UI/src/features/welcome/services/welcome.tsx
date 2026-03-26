import { axiosInstance } from "@/libs/axios";

import { PlanProps } from "@/features/billing/types/plans";

const controller = "kubernetes";



export class Welcome {
    static CreateNamespace(githubId: string, plan: PlanProps) {
        return axiosInstance.post(`${controller}/namespaces`, {
            name: githubId,
            cpu: `${plan.cpu}m`,
            ram: `${plan.ram}Mi`
        }, 
        {withCredentials: true})
    }
}