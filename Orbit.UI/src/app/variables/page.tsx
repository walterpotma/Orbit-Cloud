"use client";

import BtnRefresh from "@/components/ui/BtnRefresh";
import EmptyState from "@/components/ui/EmptyState";
import { useEffect, useState } from "react";
import { Key, Lock, Clock, Shield, Plus } from "lucide-react"; 
import { Secrets } from "@/api/kubernetes"; 
import { useUser } from "@/context/user";

export default function Page() {
    const { UserData } = useUser();
    const [loading, setLoading] = useState(true);
    const [secrets, setSecrets] = useState<any[]>([]);

    useEffect(() => {
        if (!UserData?.githubID) return;
        loadData();
    }, [UserData]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await Secrets.List(UserData?.githubID);
            console.log("Secrets loaded:", response.data);
            setSecrets(response.data);
        } catch (error) {
            console.error("Erro ao carregar variaveis de ambiente:", error);
        } finally {
            setLoading(false);
        }
    };

    // Função auxiliar para formatar data (X dias atrás)
    const timeAgo = (dateString: string) => {
        if (!dateString) return "-";
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        const days = Math.floor(diffInSeconds / 86400);
        if (days > 0) return `${days}d atrás`;
        
        const hours = Math.floor(diffInSeconds / 3600);
        if (hours > 0) return `${hours}h atrás`;
        
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m atrás`;
    };

    console.log("Rendering Page with secrets:", secrets);

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start gap-5 overflow-auto custom-scroll">
            
            {/* Cabeçalho */}
            <div className="w-full flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Environment Variables</h1>
                    <p className="text-slate-400 text-sm mt-1">Gerencie chaves de API, segredos e certificados.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.location.href = '/variables/new'}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                    >
                        <Plus size={16} /> Nova Variável
                    </button>
                    <BtnRefresh/>
                </div>
            </div>
            
            {secrets.length === 0 ? (
                <EmptyState
                    title="Nenhuma Variável de Ambiente"
                    description="Crie aqui suas variáveis de Ambiente e acesse de qualquer aplicação."
                    icon="bi bi-intersect"
                    actionLabel="Criar Variável"
                    onAction={() => window.location.href = '/variables/new'}
                />
            ) : (
                /* Tabela de Segredos */
                !loading && (
                    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                                    <th className="p-4 font-medium">Nome do Segredo</th>
                                    <th className="p-4 font-medium">Chaves (Keys)</th>
                                    <th className="p-4 font-medium">Tipo</th>
                                    <th className="p-4 font-medium">Criado em</th>
                                    <th className="p-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {secrets.map((secret, index) => (
                                    <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                                        
                                        {/* Nome */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                                    <Lock size={18} />
                                                </div>
                                                <span className="font-medium text-slate-200">{secret.name}</span>
                                            </div>
                                        </td>

                                        {/* Chaves (Keys) */}
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {secret.keys && secret.keys.length > 0 ? (
                                                    secret.keys.map((key: string) => (
                                                        <span key={key} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
                                                            <Key size={10} className="text-slate-500" />
                                                            {key}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-600 text-sm italic">Vazio</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Tipo */}
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                secret.type === 'Opaque' 
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            }`}>
                                                <Shield size={12} />
                                                {secret.type}
                                            </span>
                                        </td>

                                        {/* Data */}
                                        <td className="p-4 text-sm text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} />
                                                {timeAgo(secret.creationTimestamp)}
                                            </div>
                                        </td>

                                        {/* Ações */}
                                        <td className="p-4 text-right">
                                            <button 
                                                className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                                                title="Editar Variáveis"
                                                onClick={() => console.log("Editar", secret.name)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
}