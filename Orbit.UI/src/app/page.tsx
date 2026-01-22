"use client";
import { RefreshCcw, User } from "lucide-react";
import "./globals.css";
import Image from "next/image";
import 'devicon/devicon.min.css';
import "bootstrap-icons/font/bootstrap-icons.css"
import Card1 from "@/components/ui/dashboard/card1";
import Card2 from "@/components/ui/dashboard/card2";
import CardDeploy from "@/components/ui/dashboard/card-deploy";
import CardList1 from "@/components/ui/dashboard/card-list1";
import Table1 from "@/components/ui/dashboard/table";
import BtnRefresh from "@/components/ui/BtnRefresh";
import fileTree from "@/model/storage";
import { useEffect, useState } from "react";
import { Deployments, Pods, Namespaces } from "@/api/kubernetes";
import { useUser } from "@/context/user";
import TableDeploy from "@/components/deploy/table";
import { useRouter } from "next/navigation";

// 1. Defina limites fictícios para calcular a porcentagem (Ex: Plano Free)
const MAX_CPU_MILLICORES = 1000; // 1000m = 1 vCPU
const MAX_MEMORY_BYTES = 512 * 1024 * 1024; // 512 MiB em Bytes

// 2. Atualize a interface para bater com o JSON da API
interface NamespaceMetric {
    namespace: string;
    podCount: number;
    cpuUsage: string;      // "0m" (Texto para exibir)
    memoryUsage: string;   // "18 MiB" (Texto para exibir)
    rawCpu: number;        // 0 (Número para calcular %)
    rawMemory: number;     // 18804736 (Número para calcular %)
}

export default function Home() {
    const { UserData, isLoading } = useUser();
    const router = useRouter();

    const [deployments, setDeployments] = useState<any[]>([]);
    const [succededDeployments, setSuccededDeployments] = useState<any[]>([]);
    const [failedDeployments, setFailedDeployments] = useState<any[]>([]);
    const [pendingDeployments, setPendingDeployments] = useState<any[]>([]);

    const [namespaceMetrics, setNamespaceMetrics] = useState<NamespaceMetric | null>(null);

    // Cálculos de segurança (evita divisão por zero ou nulos)
    const rawCpu = namespaceMetrics?.rawCpu || 0;
    const rawMem = namespaceMetrics?.rawMemory || 0;

    // Regra de 3 para achar a porcentagem (Limitando a 100% para não quebrar layout)
    const cpuPercent = Math.min((rawCpu / MAX_CPU_MILLICORES) * 100, 100);
    const memPercent = Math.min((rawMem / MAX_MEMORY_BYTES) * 100, 100);

    // Texto formatado para exibir embaixo da barra
    const cpuLabel = namespaceMetrics?.cpuUsage || "0m";
    const memLabel = namespaceMetrics?.memoryUsage || "0 MiB";

    const repositorios = fileTree.filter(node => node.type === 'deploy' || node.type === 'folder' && node.branch != null);
    console.log(repositorios);
    console.log("UserData:", UserData);
    console.log("isLoading:", isLoading);

    useEffect(() => {
        if (isLoading || !UserData || !UserData.githubID) {
            return;
        }
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
    }, [UserData, isLoading]);

    useEffect(() => {
        setSuccededDeployments(deployments.filter(deploy => deploy.status.toLowerCase() === 'running'));
        setFailedDeployments(deployments.filter(deploy => deploy.status.toLowerCase() === 'failed' || deploy.status.toLowerCase() === 'error' || deploy.status.toLowerCase() === 'crashloopbackoff'));
        setPendingDeployments(deployments.filter(deploy => deploy.status.toLowerCase() === 'pending' || deploy.status.toLowerCase() === 'containercreating'));
    }, [deployments]);

    console.log(deployments);
    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start gap-5 overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <BtnRefresh />
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
                    metrics={[cpuPercent]} // Passamos a % calculada
                    subTittle={`${cpuLabel} / 1000m`} // Mostramos o texto bonito
                />
                <CardList1
                    title="Uso de RAM"
                    metrics={[memPercent]} // Passamos a % calculada
                    subTittle={`${memLabel} / 512 MiB`} // Mostramos o texto bonito
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
