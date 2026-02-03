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
import TableSecrets from "@/features/vault/components/secrets-view";

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

    // Função auxiliar para formatar da

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
                    <TableSecrets secrets={secrets} />
                </div>
            </div>
        </div>
    );
}