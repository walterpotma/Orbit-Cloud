"use client";

import BtnRefresh from "@/components/ui/button-refresh";
import EmptyState from "@/components/ui/exception-state";
import { useEffect, useState } from "react";
import { Services, Ingress } from "@/features/network/services/network";
import { useUser } from "@/context/user";
import NetWorkTable from "@/features/network/components/network-view";
import { NetworkRule }from "@/features/network/types/view";

export default function NetworkPage() {
    const { UserData, isLoading } = useUser();
    const [loading, setLoading] = useState(true);
    const [network, setNetwork] = useState<NetworkRule[]>([]);

    useEffect(() => {
        if (isLoading || !UserData || !UserData.githubID) return;
        loadData();
    }, [UserData]);

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
                            address: `${svc.name}.u-${UserData?.githubID}.svc.cluster.local`,
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
    

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start gap-5 overflow-auto custom-scroll">
            <div className="w-full flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Network</h1>
                </div>
                <BtnRefresh onClick={loadData}/>
            </div>
            
            {network.length === 0 ? (
                <EmptyState
                    title="Nenhuma Regra de Rede"
                    description="Seus deploys ainda não possuem serviços ou rotas públicas configuradas."
                    icon="bi bi-hdd-network"
                    actionLabel="Ir para Deploys"
                    onAction={() => window.location.href = '/deploy'}
                />
            ) : (
                <NetWorkTable rules={network}/>
            )}
        </div>
    );
}