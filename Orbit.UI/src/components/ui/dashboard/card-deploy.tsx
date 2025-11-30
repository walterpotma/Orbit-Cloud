"use client";
import {
    Box,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Clock,
    Activity
} from "lucide-react";

// Definindo as props para bater com o DTO do C#
type CardDeployProps = {
    name: string;
    namespace: string;
    status: string;        // "Running", "Pending", "Failed"
    ready: number;         // Réplicas prontas (Ex: 1)
    desired: number;       // Réplicas desejadas (Ex: 3)
    age: string;           // Tempo de vida (Ex: "2d")
    className?: string;
}

export default function CardDeploy({ name, namespace, status, ready, desired, age, className }: CardDeployProps) {

    // Calcula a porcentagem de saúde do deploy (Ex: 1/2 = 50%)
    const percentage = desired > 0 ? (ready / desired) * 100 : 0;

    // Função auxiliar para definir cores baseadas no status
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case "running":
                return {
                    text: "text-emerald-400",
                    bg: "bg-emerald-500",
                    border: "border-emerald-500/20",
                    icon: <CheckCircle2 className="w-4 h-4" />
                };
            case "pending":
            case "containercreating":
                return {
                    text: "text-amber-400",
                    bg: "bg-amber-500",
                    border: "border-amber-500/20",
                    icon: <Activity className="w-4 h-4 animate-pulse" />
                };
            case "failed":
            case "error":
            case "crashloopbackoff":
                return {
                    text: "text-red-400",
                    bg: "bg-red-500",
                    border: "border-red-500/20",
                    icon: <XCircle className="w-4 h-4" />
                };
            default:
                return {
                    text: "text-slate-400",
                    bg: "bg-slate-500",
                    border: "border-slate-700",
                    icon: <AlertCircle className="w-4 h-4" />
                };
        }
    };

    const style = getStatusConfig(status);

    return (
        <div className={`w-full p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-4 hover:border-slate-600 transition-all duration-300 ${className}`}>

            {/* Cabeçalho: Ícone e Títulos */}
            <div className="w-full flex justify-between gap-3 items-start">
                <div className={`p-2.5 rounded-lg bg-slate-800 border ${style.border} flex justify-center items-center`}>
                    <Box className={`w-5 h-5 ${style.text}`} />
                </div>

                <div className="w-full overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h1 className="text-base font-semibold text-white truncate" title={name}>
                            {name}
                        </h1>
                        <span className="text-sm px-2 py-0.5 bg-slate-800 rounded-full text-slate-400 border border-slate-700">
                            {namespace}
                        </span>
                    </div>

                    <div className={`flex items-center gap-1.5 mt-1 ${style.text}`}>
                        {style.icon}
                        <p className="text-sm font-medium">{status}</p>
                    </div>
                </div>
            </div>

            {/* Barra de Progresso (Réplicas) */}
            <div className="w-full space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Availability</span>
                    <span className="font-mono text-slate-300">{ready} / {desired}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${style.bg}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Rodapé: Idade */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center gap-2 text-xs text-slate-500">
                <div className="flex gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Há {age}</span>
                </div>
                <div className="flex justify-center items-center gap-2">
                    <button className="px-2 py-1 rounded-lg border border-blue-500 text-blue-500 flex gap-1 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-300">
                        <i className="bi bi-gear-fill"></i>
                        {/* <p>Editar</p> */}
                    </button>
                </div>
            </div>
        </div>
    );
}