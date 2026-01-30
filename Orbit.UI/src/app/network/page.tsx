"use client";

import { useEffect, useState } from "react";
import { 
  Globe, 
  Network, 
  ShieldCheck, 
  Wifi, 
  ArrowRightLeft,
  Server
} from "lucide-react";
import BtnRefresh from "@/components/ui/button-refresh";
import EmptyState from "@/components/ui/exception-state";
import { Services, Ingress } from "@/features/network/services/network";
import { useUser } from "@/context/user";
import NetWorkTable from "@/features/network/components/network-view";
import { NetworkRule } from "@/features/network/types/view";

export default function NetworkPage() {
    const { UserData, isLoading: isUserLoading } = useUser();
    const [loading, setLoading] = useState(true);
    const [network, setNetwork] = useState<NetworkRule[]>([]);

    useEffect(() => {
        if (isUserLoading || !UserData || !UserData.githubID) return;
        loadData();
    }, [UserData, isUserLoading]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [servicesData, ingressData] = await Promise.all([
                Services.List(UserData?.githubID),
                Ingress.List(UserData?.githubID)
            ]);

            const formattedNetwork: NetworkRule[] = [];

            if (ingressData.data) {
                ingressData.data.forEach((ing: any) => {
                    formattedNetwork.push({
                        id: `ing-${ing.name}`,
                        name: ing.name,
                        type: "External",
                        address: `${ing.rules[0].host}`, 
                        target: `${ing.name} (Service)`,
                        status: "Active"
                    });
                });
            }

            if (servicesData.data) {
                servicesData.data.forEach((svc: any) => {
                    if (svc.name !== 'kubernetes') {
                        formattedNetwork.push({
                            id: `svc-${svc.name}`,
                            name: svc.name,
                            type: "Internal",
                            address: `${svc.name}.u-${UserData?.githubID}.svc`,
                            target: `Port: ${svc.ports?.[0] || 80}`,
                            status: "Active"
                        });
                    }
                });
            }

            setNetwork(formattedNetwork);
        } catch (error) {
            console.error("Erro ao carregar rede:", error);
        } finally {
            setLoading(false);
        }
    };

    // Cálculos para os Cards de Resumo
    const externalCount = network.filter(n => n.type === 'External').length;
    const internalCount = network.filter(n => n.type === 'Internal').length;

    // Componente de Card de Estatística
    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors">
            <div className={`p-3 rounded-lg bg-zinc-950 border border-zinc-800 ${color}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{title}</p>
                <h3 className="text-xl font-bold text-zinc-100">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full p-6 md:p-8 flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Globe className="text-blue-500" size={32} />
                        <span className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                            Rede & Tráfego
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1 ml-11">
                        Visualize rotas de entrada (Ingress) e serviços internos do cluster.
                    </p>
                </div>
                <div>
                    <BtnRefresh onClick={loadData}/>
                </div>
            </div>

            {/* Cards de Resumo */}
            {!loading && network.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
                    <StatCard 
                        title="Total de Rotas" 
                        value={network.length} 
                        icon={Network} 
                        color="text-purple-500" 
                    />
                    <StatCard 
                        title="Acesso Público (Ingress)" 
                        value={externalCount} 
                        icon={Wifi} 
                        color="text-blue-400" 
                    />
                    <StatCard 
                        title="Interno (Cluster IP)" 
                        value={internalCount} 
                        icon={Server} 
                        color="text-emerald-400" 
                    />
                </div>
            )}

            {/* Conteúdo Principal */}
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-inner shadow-black/20">
                
                {/* Header da Tabela */}
                <div className="px-6 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center gap-2 backdrop-blur-sm shrink-0">
                    <ArrowRightLeft size={14} className="text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Regras de Roteamento
                    </span>
                    <span className="ml-auto text-xs text-zinc-600 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {loading ? "Carregando..." : network.length + " regras ativas"}
                    </span>
                </div>

                {/* Tabela ou Loading ou Empty State */}
                <div className="flex-1 overflow-auto custom-scroll p-1 relative">
                    {loading ? (
                        // Skeleton Loading Simples
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 bg-zinc-900/50 rounded-lg animate-pulse border border-zinc-800/50" />
                            ))}
                        </div>
                    ) : network.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <EmptyState
                                title="Nenhuma Rota Definida"
                                description="Seus deploys ainda não expuseram serviços ou rotas públicas."
                                icon="bi bi-hdd-network" // Mantendo seu ícone original ou troque se o componente suportar componente React
                                actionLabel="Criar Deploy"
                                onAction={() => window.location.href = '/deploy'}
                            />
                        </div>
                    ) : (
                        <NetWorkTable rules={network}/>
                    )}
                </div>
            </div>
            
            {/* Footer de Status */}
            {!loading && (
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 px-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span>Todas as rotas estão protegidas por firewall padrão do Orbit Cloud.</span>
                </div>
            )}
        </div>
    );
}