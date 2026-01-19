"use client";

import BtnRefresh from "@/components/ui/BtnRefresh";
import EmptyState from "@/components/ui/exception/EmptyState";
import { useEffect, useState } from "react";
import { Globe, Lock, Server, ArrowUpRight, Copy } from "lucide-react"; // Instale lucide-react
import { Services, Ingress } from "@/api/kubernetes"; // Supondo que você já criou esses arquivos de API
import { useUser } from "@/context/user";

// Interface unificada para a tabela
interface NetworkRule {
    id: string;
    name: string;
    type: "External" | "Internal"; // Ingress = External, Service = Internal
    address: string;
    target: string;
    status: string;
}

export default function NetworkPage() {
    const { UserData } = useUser();
    const [loading, setLoading] = useState(true);
    const [rules, setRules] = useState<NetworkRule[]>([]);

    useEffect(() => {
        if (!UserData?.githubID) return;
        loadData();
    }, [UserData]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Buscamos Services e Ingress em paralelo
            const [servicesData, ingressData] = await Promise.all([
                Services.List(UserData?.githubID), // Sua chamada API
                Ingress.List(UserData?.githubID)   // Sua chamada API
            ]);

            const formattedRules: NetworkRule[] = [];

            console.log('Ingress Data:', ingressData);

            // 1. Processa INGRESS (Externos)
            if (ingressData.data) {
                ingressData.data.forEach((ing: any) => {
                    formattedRules.push({
                        id: `ing-${ing.name}`,
                        name: ing.name,
                        type: "External",
                        // Assumindo que seu DTO retorna o host ou montamos aqui
                        address: `${ing.rules[0].host}`, 
                        target: `${ing.name} (Service)`,
                        status: "Active"
                    });
                });
            }

            // 2. Processa SERVICES (Internos)
            if (servicesData.data) {
                servicesData.data.forEach((svc: any) => {
                    // Filtramos o serviço padrão do kubernetes para não poluir
                    if (svc.name !== 'kubernetes') {
                        formattedRules.push({
                            id: `svc-${svc.name}`,
                            name: svc.name,
                            type: "Internal",
                            address: `${svc.name}.u-${UserData?.githubID}.svc.cluster.local`, // DNS Interno do K8s
                            target: `Port: ${svc.ports?.[0] || 80}`,
                            status: "Active"
                        });
                    }
                });
            }

            setRules(formattedRules);
        } catch (error) {
            console.error("Erro ao carregar rede:", error);
        } finally {
            setLoading(false);
        }
    };

    // Função para copiar endereço
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Aqui você pode por um toast de sucesso
    };

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start gap-5 overflow-auto custom-scroll">
            
            {/* Cabeçalho */}
            <div className="w-full flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Network</h1>
                </div>
                <BtnRefresh/>
            </div>
            
            {rules.length === 0 ? (
                <EmptyState
                    title="Nenhuma Regra de Rede"
                    description="Seus deploys ainda não possuem serviços ou rotas públicas configuradas."
                    icon="bi bi-hdd-network"
                    actionLabel="Ir para Deploys"
                    onAction={() => window.location.href = '/deploys'}
                />
            ) : (
                /* Tabela Unificada */
                !loading && (
                    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                                    <th className="p-4 font-medium">Nome</th>
                                    <th className="p-4 font-medium">Tipo de Acesso</th>
                                    <th className="p-4 font-medium">Endereço (URL / DNS)</th>
                                    <th className="p-4 font-medium">Alvo</th>
                                    <th className="p-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {rules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors group">
                                        
                                        {/* Nome */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${rule.type === 'External' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {rule.type === 'External' ? <Globe size={18} /> : <Server size={18} />}
                                                </div>
                                                <span className="font-medium text-slate-200">{rule.name}</span>
                                            </div>
                                        </td>

                                        {/* Badge de Tipo */}
                                        <td className="p-4">
                                            {rule.type === 'External' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    <Globe size={12} /> Público (Ingress)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    <Lock size={12} /> Privado (Service)
                                                </span>
                                            )}
                                        </td>

                                        {/* Endereço Clicável ou Copiável */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 group/link">
                                                <code className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-slate-400">
                                                    {rule.address}
                                                </code>
                                                <button 
                                                    onClick={() => copyToClipboard(rule.address)}
                                                    className="opacity-0 group-hover/link:opacity-100 p-1 hover:bg-slate-700 rounded text-slate-500 transition-all"
                                                    title="Copiar"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Alvo */}
                                        <td className="p-4 text-sm text-slate-400">
                                            {rule.target}
                                        </td>

                                        {/* Ações */}
                                        <td className="p-4 text-right">
                                            {rule.type === 'External' && (
                                                <a 
                                                    href={rule.address} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-400 transition-all"
                                                    title="Abrir no navegador"
                                                >
                                                    <ArrowUpRight size={16} />
                                                </a>
                                            )}
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