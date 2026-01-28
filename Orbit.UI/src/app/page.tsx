"use client";
import "./globals.css";
import 'devicon/devicon.min.css';
import "bootstrap-icons/font/bootstrap-icons.css"
import Card1 from "@/features/dashboard/components/card1";
import CardList1 from "@/features/dashboard/components/deploy-card-list";
import BtnRefresh from "@/components/ui/BtnRefresh";
import fileTree from "@/features/storage/types/storage";
import { useEffect, useState } from "react";
import { Deployments, Pods, Namespaces } from "@/api/kubernetes";
import { useUser } from "@/context/user";
import TableDeploy from "@/features/deploy/components/deploy-table";
import { useRouter } from "next/navigation";

const MAX_CPU_MILLICORES = 1000;
const MAX_MEMORY_BYTES = 512 * 1024 * 1024;

interface NamespaceMetric {
    namespace: string;
    podCount: number;
    cpuUsage: string;
    memoryUsage: string;
    rawCpu: number;
    rawMemory: number;
}

export default function Home() {
    const { UserData, isLoading } = useUser();
    const router = useRouter();

    const [deployments, setDeployments] = useState<any[]>([]);
    const [succededDeployments, setSuccededDeployments] = useState<any[]>([]);
    const [failedDeployments, setFailedDeployments] = useState<any[]>([]);
    const [pendingDeployments, setPendingDeployments] = useState<any[]>([]);

    const [namespaceMetrics, setNamespaceMetrics] = useState<NamespaceMetric | null>(null);

    const rawCpu = namespaceMetrics?.rawCpu || 0;
    const rawMem = namespaceMetrics?.rawMemory || 0;

    const cpuPercent = Math.min((rawCpu / MAX_CPU_MILLICORES) * 100, 100);
    const memPercent = Math.min((rawMem / MAX_MEMORY_BYTES) * 100, 100);

    const cpuLabel = namespaceMetrics?.cpuUsage || "0m";
    const memLabel = namespaceMetrics?.memoryUsage || "0 MiB";

    useEffect(() => {
        if (isLoading || !UserData || !UserData.githubID) {
            return;
        }
        loadData();
    }, [UserData, isLoading]);

    const loadData = async () => {
        if (!UserData) return;
        Deployments.List(UserData.githubID)
            .then((response: any) => {
                console.log(response.data);
                setDeployments(response.data);
            })
            .catch((error: any) => {
                console.error("Error fetching Deployments:", error);
            });
        Namespaces.Metrics(UserData.githubID)
            .then((response: any) => {
                console.log("Namespace Metrics:", response.data);
                setNamespaceMetrics(response.data);
            })
            .catch((error: any) => {
                console.error("Error fetching Namespace Metrics:", error);
            });
    };

    useEffect(() => {
        setSuccededDeployments(deployments.filter(deploy => deploy.status.toLowerCase() === 'running'));
        setFailedDeployments(deployments.filter(deploy => deploy.status.toLowerCase() === 'failed' || deploy.status.toLowerCase() === 'error' || deploy.status.toLowerCase() === 'crashloopbackoff'));
        setPendingDeployments(deployments.filter(deploy => deploy.status.toLowerCase() === 'pending' || deploy.status.toLowerCase() === 'containercreating'));
    }, [deployments]);

    console.log(deployments);
    return (
        <div className="w-full h-full box-border px-8 py-8 flex flex-col justify-start items-start gap-5 overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <BtnRefresh onClick={loadData} />
                </div>
                <div className="w-full flex justify-around space-x-5">
                    <Card1 title="Deploys" value={succededDeployments.length} analysis="Bem Sucedidos" className="" />
                    <Card1 title="Deploys" value={pendingDeployments.length} analysis="Pendentes" className="" />
                    <Card1 title="Deploys" value={failedDeployments.length} analysis="Falhos" className="" />
                    <Card1 title="Builds" value={0} analysis="Mensais" className="" />
                </div>
            </div>
            <div className="w-full flex gap-5">
                <CardList1
                    title="Uso de vCPU"
                    metrics={[cpuPercent]}
                    subTittle={`${cpuLabel} / 1000m`}
                />
                <CardList1
                    title="Uso de RAM"
                    metrics={[memPercent]}
                    subTittle={`${memLabel} / 512 MiB`}
                />
            </div>
            <div className="w-full mt-4">
                <div className="w-full flex justify-between items-center">
                    <h1 className="my-4 text-2xl text-slate-300 mb-4 flex space-x-3"><i className="bi bi-app-indicator"></i><p>Aplicações Recentes</p></h1>
                    {deployments.length > 0 && (
                        <button onClick={() => {router.push('/deploy');}} className="px-4 py-2 rounded-lg border-1 border-blue-600 text-blue-600 text-smr cursor-pointer hover:bg-blue-600 hover:text-white transition ease-in-out duration-200">Ver Todos</button>
                    )}
                </div>
                <TableDeploy deployments={deployments} />
            </div>
        </div>
    );
}
