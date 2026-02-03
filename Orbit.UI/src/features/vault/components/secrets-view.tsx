"use client";

import EmptyState from "@/components/ui/exception-state";
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

export default function Table({ secrets }: { secrets: any[] }) {
    const router = useRouter();


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
        <div>
            {secrets.length === 0 ? (
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
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${secret.type === 'Opaque'
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
        </div>);
}