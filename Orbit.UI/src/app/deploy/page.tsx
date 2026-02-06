"use client"
import 'devicon/devicon.min.css';
import { useState, useEffect } from "react";
import { Rocket, Plus, Layers } from "lucide-react"; // Novos ícones
import NewDeploy from "@/features/deploy/components/deploy-new";
import EditDeploy from "@/features/deploy/components/deploy-edit";
import BtnRefresh from "@/components/ui/button-refresh";
import { Deployments } from "@/features/deploy/services/deployments";
import { useUser } from "@/context/user";
import TableDeploy from "@/features/deploy/components/deploy-view";
import ChartCalender from '@/components/charts/chart-calender';
import { useRouter } from "next/navigation";

export default function DeployPage() {
    const { UserData, isLoading } = useUser();
    const router = useRouter();
    const [deployments, setDeployments] = useState<any[]>([]);
    const [newDeploy, setNewDeploy] = useState(false);
    const [editDeploy, setEditDeploy] = useState(false);

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
    }

    return (
        <div className="w-full p-6 md:p-8 flex flex-col bg-zinc-950 text-zinc-100">
            
            {/* Header */}
            <div className="flex justify-between items-end mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Rocket className="text-blue-500" size={32} />
                        <span>
                            Deploys
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1 ml-11">
                        Gerencie suas aplicações em execução no cluster.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.push("/deploy/new")} 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105 font-medium text-sm"
                    >
                        <Plus size={18} />
                        Novo Deploy
                    </button>
                    <div onClick={loadData}>
                        <BtnRefresh />
                    </div>
                </div>
            </div>

            {/* Container da Tabela com Estilo Glass/Card */}
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex flex-col shadow-inner shadow-black/20">
                
                {/* Barra de Título da Tabela (Opcional, mas ajuda na organização) */}
                <div className="px-6 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center gap-2 backdrop-blur-sm shrink-0">
                    <Layers size={14} className="text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Lista de Aplicações
                    </span>
                    <span className="ml-auto text-xs text-zinc-600 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        Total: {deployments.length}
                    </span>
                </div>

                {/* Área da Tabela (Scrollável) */}
                <div className="flex-1 overflow-auto custom-scroll p-1">
                    <TableDeploy deployments={deployments} />
                </div>
            </div>

            {/* <div>
                <ChartCalender/>
            </div> */}

            {/* Modals */}
            {newDeploy && (
                <NewDeploy onClose={setNewDeploy} />
            )}

            {editDeploy && (
                // Ajustei para fixed inset-0 para garantir que cubra a tela toda e fique acima de tudo
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl">
                        <EditDeploy onClose={setEditDeploy} />
                    </div>
                </div>
            )}

        </div>
    );
}