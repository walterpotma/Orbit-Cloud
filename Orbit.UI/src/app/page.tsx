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

const MAX_CPU_MILLICORES = 1000;
const MAX_MEMORY_BYTES = 512 * 1024 * 1024;

export default function Home() {
    const { UserData, isLoading } = useUser();
    const router = useRouter();

    const [deployments, setDeployments] = useState<any[]>([]);
    const [succededDeployments, setSuccededDeployments] = useState<any[]>([]);
    const [failedDeployments, setFailedDeployments] = useState<any[]>([]);
    const [pendingDeployments, setPendingDeployments] = useState<any[]>([]);
    const [namespaceMetrics, setNamespaceMetrics] = useState<NamespaceMetric | null>(null);

    // Cálculos de métricas
    const rawCpu = namespaceMetrics?.rawCpu || 0;
    const rawMem = namespaceMetrics?.rawMemory || 0;
    const cpuPercent = Math.min((rawCpu / MAX_CPU_MILLICORES) * 100, 100);
    const memPercent = Math.min((rawMem / MAX_MEMORY_BYTES) * 100, 100);
    const cpuLabel = namespaceMetrics?.cpuUsage || "0m";
    const memLabel = namespaceMetrics?.memoryUsage || "0 MiB";
    const cpuLabelLimits = namespaceMetrics?.cpuLimit || "0m";
    const memLabelLimits = namespaceMetrics?.memoryLimit || "0 MiB";
    const rawCpuLimits = namespaceMetrics?.rawCpuLimit || 0;
    const rawMemLimits = namespaceMetrics?.rawMemoryLimit || 0;

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
    };

    useEffect(() => {
        setSuccededDeployments(deployments.filter(d => d.status.toLowerCase() === 'running'));
        setFailedDeployments(deployments.filter(d => ['failed', 'error', 'crashloopbackoff'].includes(d.status.toLowerCase())));
        setPendingDeployments(deployments.filter(d => ['pending', 'containercreating'].includes(d.status.toLowerCase())));
    }, [deployments]);

    // Componente Interno para o Status Card
    const StatusCard = ({ title, value, icon: Icon, color, sub }: any) => (
        <div className="relative overflow-hidden bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={64} />
            </div>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 ${color}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-zinc-400 text-sm font-medium">{title}</p>
                    <h3 className="text-2xl font-bold text-zinc-100">{value}</h3>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
                <span className="text-xs text-zinc-500 font-mono">{sub}</span>
            </div>
        </div>
    );

    // Componente Interno para o Gráfico Circular
    const CircularProgress = ({ percentage, color, icon: Icon, label, subLabel }: any) => {
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                <div className="relative flex items-center justify-center">
                    <svg className="transform -rotate-90 w-24 h-24">
                        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-800" />
                        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
                            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={`${color} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                    </svg>
                    <div className={`absolute ${color}`}>
                        <Icon size={20} />
                    </div>
                </div>
                <div className="text-center mt-2">
                    <p className="text-lg font-bold text-zinc-200">{Math.round(percentage)}%</p>
                    <p className="text-xs text-zinc-500 font-medium">{label}</p>
                    <p className="text-[10px] text-zinc-600 font-mono mt-1">{subLabel}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8 overflow-y-auto custom-scroll">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        Visão Geral
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Bem-vindo ao cockpit do Orbit Cloud.</p>
                </div>
                <div onClick={loadData}>
                    <ButtonRefresh />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Coluna da Esquerda: Cards de Status (Ocupa 2/3 no desktop) */}
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
                        value={0} // Placeholder, conecte ao real se tiver
                        icon={Layers} 
                        color="text-purple-500" 
                        sub="Builds mensais"
                    />
                </div>

                {/* Coluna da Direita: Recursos (Ocupa 1/3 no desktop) */}
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
                    
                    {/* <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
                        <span>Namespace: {UserData?.githubID || 'default'}</span>
                        <div className="flex items-center gap-1 text-emerald-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online
                        </div>
                    </div> */}
                </div>
            </div>

            {/* Tabela de Aplicações */}
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
                
                {/* Wrapper para a tabela existente manter o estilo */}
                <div className="p-2">
                    <TableDeploy deployments={deployments} />
                </div>
            </div>
        </div>
    );
}