"use client";
import { RefreshCcw } from "lucide-react";
import "./globals.css";
import Image from "next/image";
import 'devicon/devicon.min.css';
import "bootstrap-icons/font/bootstrap-icons.css"
import Card1 from "@/components/ui/dashboard/card1";
import Card2 from "@/components/ui/dashboard/card2";
import CardDeploy from "@/components/ui/dashboard/card-deploy";
import CardList1 from "@/components/ui/dashboard/card-list1";
import Table1 from "@/components/ui/dashboard/table";
import BtnRefresh from "@/components/ui/BtnRefresh";
import fileTree from "@/model/storage";
import { useEffect, useState } from "react";
import { Pods } from "@/api/kubernetes";

export default function Home() {
    const [kubernetesPods, setKubernetesPods] = useState<any[]>([]);
    const repositorios = fileTree.filter(node => node.type === 'deploy' || node.type === 'folder' && node.branch != null);
    console.log(repositorios);

    useEffect(() => {
        Pods.List()
            .then((response: any) => {
                console.log(response.data);
                setKubernetesPods(response.data);
            })
            .catch((error: any) => {
                console.error("Error fetching pods:", error);
            });
    }, []);


    console.log(kubernetesPods);
    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start gap-5 overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <BtnRefresh />
                </div>
                <div className="w-full flex justify-around space-x-5">
                    <Card1 title="Deploys" value={repositorios.length} analysis="Ativos" className="" />
                    <Card1 title="Deploys" value={repositorios.filter(repos => repos.type === 'deploy').length} analysis="Pausados" className="" />
                    <Card1 title="Sub-Dominios" value={0} analysis="Registrados" className="" />
                    <Card1 title="Builds" value={0} analysis="Mensais" className="" />
                </div>
            </div>
            <div className="w-full flex gap-5">
                <CardList1 title="Uso de vCPU" metrics={[10]} />
                <CardList1 title="Uso de RAM" metrics={[40]} />
            </div>
            <div className="w-full mt-4">
                <div className="w-full flex justify-between items-center">
                    <h1 className="my-4 text-2xl text-slate-300 mb-4 flex space-x-3"><i className="bi bi-app-indicator"></i><p>Aplicações Recentes</p></h1>
                    <button className="px-4 py-2 rounded-lg border-1 border-blue-600 text-blue-600 text-sm">Ver Todos</button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {kubernetesPods.map(pod => (
                        <CardDeploy
                            // Use ?. para evitar erros se metadata não existir
                            key={pod?.uid || Math.random()}
                            title={pod?.name || "Pod sem nome"}
                            metrics={[
                                Math.floor(Math.random() * 100),
                                Math.floor(Math.random() * 100),
                                Math.floor(Math.random() * 100)
                            ]}
                            // Mesma coisa aqui para o status
                            subTittle={`Status: ${pod?.status || "Desconhecido"}`}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full mt-4">
                <h1 className="my-4 text-2xl text-slate-300 mb-4 flex space-x-3"><i className="bi bi-box-seam-fill"></i><p>Repositorios Recentes</p></h1>
                <div className="grid grid-cols-3 gap-4">
                    {repositorios.map(repos => {
                        if (repos.type === 'file' && repos.branch == null) return null;
                        return (
                            <Card2 key={repos.name} data={{
                                type: repos.type,
                                icone: repos.language,
                                title: repos.name,
                                tecnologia: repos.language,
                                nota: 3.9,
                                branch: repos.branch
                            }} />
                        );
                    })}
                </div>
            </div>
            <div className="w-full mt-4">
                <h1 className="my-4 text-2xl text-slate-300 mb-4 flex space-x-3"><i className="bi bi-layer-forward"></i><p>Ultimos Deploys</p></h1>
                <Table1 />
            </div>
        </div>
    );
}
