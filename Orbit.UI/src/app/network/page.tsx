"use client";

import BtnRefresh from "@/components/ui/BtnRefresh";
import EmptyState from "@/components/ui/exception/EmptyState";
import { useEffect, useState } from "react";
import { Globe, Lock, Server, ArrowUpRight, Copy } from "lucide-react"; // Instale lucide-react
import { Services, Ingress } from "@/api/kubernetes"; // Supondo que você já criou esses arquivos de API
import { useUser } from "@/context/user";
import NetWorkTable from "@/components/network/table";

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
                    onAction={() => window.location.href = '/deploy'}
                />
            ) : (
                <NetWorkTable rules={rules}/>
            )}
        </div>
    );
}