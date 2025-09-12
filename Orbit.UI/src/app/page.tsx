import { RefreshCcw } from "lucide-react";
import "./globals.css";
import Image from "next/image";
import 'devicon/devicon.min.css';
import "bootstrap-icons/font/bootstrap-icons.css"
import Card1 from "@/components/ui/card1";
import Card2 from "@/components/ui/card2";
import Table1 from "@/components/ui/table1";
import BtnRefresh from "@/components/ui/BtnRefresh";
import fileTree from "@/model/file-system";

export default function Home() {
    const repositorios = fileTree.filter(node => node.type === 'deploy' || node.type === 'folder' && node.branch != null);
    console.log(repositorios);

    const selectIcon = (language: string | undefined) => {
        if (language !== undefined) return <i className={`devicon-${language.toLowerCase()}-plain`}></i>;
        return <i className="bi bi-git"></i>;
    }

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <BtnRefresh />
                </div>
                <div className="w-full flex justify-around items-center space-x-5">
                    <Card1 title="Total de Repositorios" value={repositorios.length} analysis="registrados" className="" />
                    <Card1 title="Repositorios Ativos" value={repositorios.filter(repos => repos.type === 'deploy').length} analysis="ativos e rodando" className="" />
                    <Card1 title="Nada ainda" value={0} analysis="Nada ainda" className="" />
                    <Card1 title="Nada ainda" value={0} analysis="Nada ainda" className="" />
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
                                icone: selectIcon(repos.language),
                                title: repos.name,
                                tecnologia: repos.language == null ? "N/A" : repos.language,
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
