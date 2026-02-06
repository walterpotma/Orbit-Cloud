"use client";
import "./globals.css";
import 'devicon/devicon.min.css';
import { useEffect, useState } from "react";
import { useUser } from "@/context/user";
import { useRouter } from "next/navigation";
import { Deployments } from "@/features/deploy/services/deployments";
import { Namespaces } from "@/features/dashboard/services/namespace";
import { NamespaceMetric } from "@/features/dashboard/types/namespace-view";
import TableDeploy from "@/features/deploy/components/deploy-view";
import ButtonRefresh from "@/components/ui/button-refresh";
import StatusCard from "@/features/dashboard/components/dash-status-card";
import CircularProgress from "@/features/dashboard/components/dash-circular-progress";
import ChartLine from "@/components/charts/chart-line";
import ChartBar from "@/components/charts/chart-bar";
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    Clock,
    Layers,
    Cpu,
    Zap,
    Server,
    ArrowRight
} from "lucide-react";
import { Prometheus } from "@/features/dashboard/services/prometheus";

export default function Home() {
    const { UserData, isLoading } = useUser();
    const router = useRouter();
    const [cpuMetrics, setCpuMetrics] = useState<any[]>([]);
    const [memMetrics, setMemMetrics] = useState<any[]>([]);

    const [deployments, setDeployments] = useState<any[]>([]);
    const [succededDeployments, setSuccededDeployments] = useState<any[]>([]);
    const [failedDeployments, setFailedDeployments] = useState<any[]>([]);
    const [pendingDeployments, setPendingDeployments] = useState<any[]>([]);
    const [namespaceMetrics, setNamespaceMetrics] = useState<NamespaceMetric | null>(null);

    const rawCpu = namespaceMetrics?.rawCpu || 0;
    const rawMem = namespaceMetrics?.rawMemory || 0;
    const rawCpuLimits = namespaceMetrics?.rawCpuLimit || 0;
    const rawMemLimits = namespaceMetrics?.rawMemoryLimit || 0;

    const cpuLabel = namespaceMetrics?.cpuUsage || "0m";
    const memLabel = namespaceMetrics?.memoryUsage || "0 MiB";
    const cpuLabelLimits = namespaceMetrics?.cpuLimit || "0m";
    const memLabelLimits = namespaceMetrics?.memoryLimit || "0 MiB";

    const cpuPercent = rawCpuLimits > 0 ? Math.min((rawCpu / rawCpuLimits) * 100, 100) : 0;
    const memPercent = rawMemLimits > 0 ? Math.min((rawMem / rawMemLimits) * 100, 100) : 0;

    useEffect(() => {
        if (isLoading || !UserData || !UserData.githubID) return;
        loadData();
    }, [UserData, isLoading]);

    const loadData = async () => {
        if (!UserData) return;
        Deployments.List(UserData.githubID)
            .then((res: any) => setDeployments(res.data))
            .catch((err: any) => console.error("Error fetching Deploys:", err));

        Namespaces.Metrics(UserData.githubID)
            .then((res: any) => setNamespaceMetrics(res.data))
            .catch((err: any) => console.error("Error fetching Metrics:", err));

        Prometheus.CPU(UserData.githubID)
            .then((res: any) => setCpuMetrics(res.data))
            .catch((err: any) => console.error("Error fetching Metrics CPU:", err));

        Prometheus.Memory(UserData.githubID)
            .then((res: any) => setMemMetrics(res.data))
            .catch((err: any) => console.error("Error fetching Metrics CPU:", err));
    };

    useEffect(() => {
        setSuccededDeployments(deployments.filter(d => d.status.toLowerCase() === 'running'));
        setFailedDeployments(deployments.filter(d => ['failed', 'error', 'crashloopbackoff'].includes(d.status.toLowerCase())));
        setPendingDeployments(deployments.filter(d => ['pending', 'containercreating'].includes(d.status.toLowerCase())));
    }, [deployments]);

    return (
        <div className="w-full h-full bg-zinc-950 text-zinc-100 p-6 md:p-8 overflow-y-auto custom-scroll space-y-8">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    {/* bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent */}
                    <h1 className="text-3xl font-bold">
                        Visão Geral
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Bem-vindo ao cockpit do Orbit Cloud.</p>
                </div>
                <div onClick={loadData}>
                    <ButtonRefresh />
                </div>
            </div>

            <div className="flex flex-col-reverse gap-6 lg:grid lg:grid-cols-3">

                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatusCard
                        title="Em Execução"
                        value={succededDeployments.length}
                        icon={CheckCircle2}
                        color="text-emerald-500"
                        sub="Containers saudáveis"
                    />
                    <StatusCard
                        title="Pendentes"
                        value={pendingDeployments.length}
                        icon={Clock}
                        color="text-amber-500"
                        sub="Aguardando recursos"
                    />
                    <StatusCard
                        title="Falhas"
                        value={failedDeployments.length}
                        icon={AlertCircle}
                        color="text-rose-500"
                        sub="Requer atenção"
                    />
                    <StatusCard
                        title="Total Builds"
                        value={deployments.length}
                        icon={Layers}
                        color="text-purple-500"
                        sub="Builds mensais"
                    />
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-blue-500" size={20} />
                        <h2 className="font-semibold text-zinc-200">Saúde do Cluster</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-full">
                        <CircularProgress
                            percentage={cpuPercent}
                            color="text-blue-500"
                            icon={Cpu}
                            label="CPU"
                            subLabel={`${cpuLabel} / ${cpuLabelLimits}`}
                        />
                        <CircularProgress
                            percentage={memPercent}
                            color="text-violet-500"
                            icon={Zap}
                            label="Memória"
                            subLabel={`${memLabel} / ${memLabelLimits}`}
                        />
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col lg:flex-row justify-between gap-10">
                <ChartLine
                    tittle="Uso de CPU"
                    subtittle="Monitoramento em Tempo Real"
                    data={cpuMetrics}
                />
                <ChartBar
                    title="Consumo de Memória (Pod: Orbit-API)"
                    subtitle="Métricas das últimas 24 horas"
                    data={memMetrics}
                />
            </div>

            <div className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                        <Server className="text-zinc-400" size={18} />
                        <h2 className="text-lg font-semibold text-zinc-200">Aplicações Recentes</h2>
                    </div>
                    {deployments.length > 0 && (
                        <button
                            onClick={() => router.push('/deploy')}
                            className="group flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Ver Todos
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
                <TableDeploy deployments={deployments} />
            </div>
        </div>
    );
}