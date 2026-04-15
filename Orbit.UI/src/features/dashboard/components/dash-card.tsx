"use client";
import {
    Box,
    CheckCircle2,
    Activity,
    XCircle,
    AlertCircle,
    Clock,
    Cpu,
    Zap,
    Disc3
} from "lucide-react";
import CircularProgressMini from "@/features/dashboard/components/dash-circular-progress-mini";

type CardDeployProps = {
    name: string;
    namespace: string;
    status: string;
    ready: number;
    desired: number;
    age: string;
    tag: string;
    className?: string;
}

export default function CardDeploy({ name, namespace, status, ready, desired, age, tag, className }: CardDeployProps) {

    // Configuração de cores e ícones do cabeçalho
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case "running":
                return { text: "text-emerald-400", border: "border-emerald-500/20", icon: <CheckCircle2 className="w-4 h-4" /> };
            case "pending":
                return { text: "text-amber-400", border: "border-amber-500/20", icon: <Activity className="w-4 h-4 animate-pulse" /> };
            default:
                return { text: "text-red-400", border: "border-red-500/20", icon: <XCircle className="w-4 h-4" /> };
        }
    };

    const style = getStatusConfig(status);

    // Lógica das Barras de Réplicas (Dashed)
    // Criamos um array com o tamanho do 'desired'
    const replicas = Array.from({ length: desired }, (_, i) => {
        // Se o index for menor que o número de réplicas prontas, ela está Running (Verde)
        // Se o status geral for pending e estivermos criando, usamos Amber
        // Se houver erro, usamos Red
        let stateColor = "bg-zinc-800"; // Default / Offline

        if (i < ready) {
            stateColor = "bg-emerald-500";
        } else if (status.toLowerCase() === "pending") {
            stateColor = "bg-amber-500 animate-pulse";
        } else {
            stateColor = "bg-red-500";
        }
        return stateColor;
    });

    return (
        <div className={`group relative w-full p-6 bg-zinc-950/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl hover:border-zinc-700/50 hover:bg-zinc-900/60 transition-all duration-300 ${className}`}>
            <div className="flex flex-col gap-6">

                {/* Top Section */}
                <div className="grid grid-cols-[1fr,auto] gap-4 items-center">
                    <div className="flex justify-between gap-4">
                        <div className="flex gap-3">
                            <div className={`p-3.5 rounded-xl bg-zinc-950 border ${style.border} flex justify-center items-center shadow-inner`}>
                                <Box className={`w-9 h-9 ${style.text}`} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-xl font-bold text-zinc-100 tracking-tight leading-tight truncate max-w-[140px]" title={name}>{name}</h1>
                                <div className={`flex items-center gap-1.5 mt-0.5 ${style.text}`}>
                                    {style.icon}
                                    <span className="text-xs font-bold uppercase tracking-widest">{status}</span>
                                </div>
                            </div>
                        </div>
                        <div className="gap-3 flex items-center justify-between pt-4 border-t border-zinc-800/50 text-[10px]">
                            <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="whitespace-nowrap">HÁ {age.toUpperCase()}</span>
                            </div>
                            <span className="px-2.5 py-1 bg-zinc-950/50 text-zinc-400 border border-zinc-800 rounded-lg font-mono">
                                {tag}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <CircularProgressMini percentage={0} color="text-blue-500" icon={Cpu} label="CPU" />
                        <CircularProgressMini percentage={0} color="text-violet-500" icon={Zap} label="RAM" />
                        <CircularProgressMini percentage={0} color="text-indigo-500" icon={Disc3} label="DISK" />
                    </div>
                </div>

                {/* Replica Status Section (O NOVO DASHED BAR) */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end text-[11px] uppercase tracking-tighter font-bold">
                        <span className="text-zinc-500">Replicas</span>
                        <span className="text-zinc-300 font-mono tracking-normal">{ready} / {desired}</span>
                    </div>

                    {/* Grid de Barras Separadas */}
                    <div className="flex w-full gap-1.5 h-2">
                        {replicas.map((colorClass, index) => (
                            <div
                                key={index}
                                className={`flex-1 h-full rounded-sm transition-all duration-500 ${colorClass}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom Section */}

            </div>
        </div>
    );
}