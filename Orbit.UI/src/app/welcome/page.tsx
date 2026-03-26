"use client";
import { useUser } from "@/context/user";
import { Welcome } from "@/features/welcome/services/welcome";
import { PlanProps } from "@/features/billing/types/plans";
import { useEffect } from "react";

const pricing = {
    cpuUnit: 2,  // a cada 100m
    ramUnit: 2,  // a cada 100Mi
    diskUnit: 0.5 // por GB
}

const planos = [
    { name: "Micro", cpu: 250, ram: 500, disk: 10 },
    { name: "Starter", cpu: 500, ram: 1000, disk: 20 },
    { name: "Advanced", cpu: 1000, ram: 2000, disk: 50 },
    { name: "Professional", cpu: 1000, ram: 4000, disk: 100 },
    { name: "Enterprise", cpu: 2000, ram: 8000, disk: 250 },
    { name: "Ultra", cpu: 4000, ram: 16000, disk: 500 }
];

export default function Page() {
        const { UserData, isLoading: isUserLoading } = useUser();

        useEffect(() => {
            if (isUserLoading || !UserData?.githubID) return;
            // loadData();
        }, [UserData, isUserLoading]);

        const calculatePrice = (p: any) => {
            const cpuCost = (p.cpu / 100) * pricing.cpuUnit;
            const ramCost = (p.ram / 100) * pricing.ramUnit;
            const diskCost = p.disk * pricing.diskUnit;
            return (cpuCost + ramCost + diskCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        };

        const onSelectPlan = (plan: PlanProps) => {
            try {
                if (!UserData) return;
                const response = Welcome.CreateNamespace(UserData.githubID, plan);
                console.log(response);
            }
            catch (error) {
                console.log("[Fail] Erro ao tentar criar namespace");
            }
        }

        return (
            <div className="flex flex-col justify-center items-center w-full min-h-screen bg-neutral-950 text-white p-10">
                <div className="w-full max-w-6xl mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                        Seja bem vindo a Orbit Cloud
                    </h1>
                    <p className="text-neutral-400 mt-2 text-xl">Potência de Datacenter com preço de Home Lab</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                    {planos.map((plan, idx) => (
                        <div key={idx} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-blue-500 transition-all group">
                            <h3 className="text-2xl font-bold mb-4 capitalize text-blue-400">{plan.name}</h3>

                            <div className="space-y-2 mb-8 text-neutral-300">
                                <p className="flex justify-between"><span>CPU:</span> <b>{plan.cpu}m</b></p>
                                <p className="flex justify-between"><span>RAM:</span> <b>{plan.ram >= 1000 ? plan.ram / 1000 + " Gi" : plan.ram + " Mi"}</b></p>
                                <p className="flex justify-between"><span>Disco:</span> <b>{plan.disk} GB</b></p>
                            </div>

                            <div className="text-3xl font-bold mb-6">
                                {calculatePrice(plan)} <span className="text-sm font-normal text-neutral-500">/mês</span>
                            </div>

                            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-colors">
                                Selecionar Plano
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }