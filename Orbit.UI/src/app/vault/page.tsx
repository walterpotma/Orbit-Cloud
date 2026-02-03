"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  Plus, 
  Key, 
  Lock, 
  Fingerprint, 
  Clock, 
  Edit, 
  Trash2,
  FileKey
} from "lucide-react"; 
import BtnRefresh from "@/components/ui/button-refresh";
import EmptyState from "@/components/ui/exception-state";
import { Secrets } from "@/features/vault/services/secrets"; 
import { useUser } from "@/context/user";

export default function VaultPage() {
    const { UserData, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [secrets, setSecrets] = useState<any[]>([]);

    useEffect(() => {
        if (isUserLoading || !UserData?.githubID) return;
        loadData();
    }, [UserData, isUserLoading]);

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

    // Função auxiliar para formatar data
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

    return (
        <div className="w-full h-full p-6 md:p-8 flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="text-yellow-500" size={32} />
                        <span>
                            Cofre & Variáveis
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1 ml-11">
                        Gerencie segredos, tokens e configurações sensíveis do cluster.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.push('/variables/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105 font-medium text-sm"
                    >
                        <Plus size={18} />
                        Novo Segredo
                    </button>
                    <BtnRefresh onClick={loadData} />
                </div>
            </div>

            {/* Container Principal */}
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-inner shadow-black/20">
                
                {/* Header da Tabela */}
                <div className="px-6 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center gap-2 backdrop-blur-sm shrink-0">
                    <FileKey size={14} className="text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Lista de Segredos (Kubernetes Secrets)
                    </span>
                    <span className="ml-auto text-xs text-zinc-600 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {secrets.length} itens protegidos
                    </span>
                </div>

                {/* Conteúdo da Tabela */}
                <div className="flex-1 overflow-auto custom-scroll">
                    {loading ? (
                         // Skeleton Loading
                         <div className="p-4 space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-16 bg-zinc-900/50 rounded-lg animate-pulse border border-zinc-800/50" />
                            ))}
                        </div>
                    ) : secrets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <EmptyState
                                title="Cofre Vazio"
                                description="Nenhuma variável de ambiente ou segredo configurado."
                                icon="bi bi-shield-lock" // Mantendo compatibilidade com seu componente ou troque se puder
                                actionLabel="Criar Primeiro Segredo"
                                onAction={() => router.push('/variables/new')}
                            />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-md z-10 shadow-sm">
                                <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                                    <th className="p-4 font-medium">Nome do Segredo</th>
                                    <th className="p-4 font-medium">Chaves (Keys)</th>
                                    <th className="p-4 font-medium">Tipo</th>
                                    <th className="p-4 font-medium">Atualizado</th>
                                    <th className="p-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {secrets.map((secret, index) => (
                                    <tr key={index} className="hover:bg-zinc-800/30 transition-colors group">
                                        
                                        {/* Coluna Nome */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 border border-yellow-500/10">
                                                    <Lock size={18} />
                                                </div>
                                                <span className="font-medium text-zinc-200">{secret.name}</span>
                                            </div>
                                        </td>

                                        {/* Coluna Chaves */}
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {secret.keys && secret.keys.length > 0 ? (
                                                    secret.keys.map((key: string) => (
                                                        <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 font-mono">
                                                            <Key size={10} className="text-zinc-600" />
                                                            {key}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-zinc-600 text-xs italic">Sem chaves</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Coluna Tipo */}
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                secret.type === 'Opaque' 
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            }`}>
                                                <Fingerprint size={12} />
                                                {secret.type || 'Opaque'}
                                            </span>
                                        </td>

                                        {/* Coluna Data */}
                                        <td className="p-4 text-sm text-zinc-500">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} />
                                                {timeAgo(secret.creationTimestamp)}
                                            </div>
                                        </td>

                                        {/* Coluna Ações */}
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Editar Segredo"
                                                    onClick={() => console.log("Editar", secret.name)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Excluir Segredo"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}