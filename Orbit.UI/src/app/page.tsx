import { RefreshCcw } from "lucide-react";
import Image from "next/image";
import Card1 from "@/components/ui/card1";
import Card2 from "@/components/ui/card2";
import Table1 from "@/components/ui/table1";
import "bootstrap-icons/font/bootstrap-icons.css"
import 'devicon/devicon.min.css';

export default function Home() {
    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <button className="py-2 px-4 rounded-lg text-blue-500 text-sm border border-blue-600 flex justify-center items-center space-x-2 cursor-pointer hover:bg-blue-600/20 transition ease-in-out duration-200"><p>Refresh</p> <RefreshCcw size={16} /></button>
                </div>
                <div className="w-full flex justify-around items-center space-x-5">
                    <Card1 title="Repositorios Ativos" value={5} analysis="15% a mais" className="" />
                    <Card1 title="Pipelines Rodadas" value={3} analysis="3% a menos" className="" />
                    <Card1 title="Tarefas com Sucesso" value={21} analysis="0%" className="" />
                    <Card1 title="Ultima Tarefa" value={45} analysis="Minutos atras" className="" />
                </div>
            </div>
            <div className="w-full mt-4">
                <h1 className="my-4 text-2xl text-slate-300 mb-4 flex space-x-3"><i className="bi bi-box-seam-fill"></i><p>Repositorios Recentes</p></h1>
                <div className="flex space-x-4">
                    <Card2 data={{
                        icone: <i className="bi bi-javascript"></i>,
                        title: "Projeto-teste-js",
                        tecnologia: "JavaScript",
                        nota: 3.9,
                        branchs: 2
                    }} />
                    <Card2 data={{
                        icone: <i className="devicon-csharp-plain-wordmark"></i>,
                        title: "WebApi-teste",
                        tecnologia: "C#",
                        nota: 4.5,
                        branchs: 3
                    }} />
                    <Card2 data={{
                        icone: <i className="devicon-python-plain"></i>,
                        title: "ApiFlask-teste",
                        tecnologia: "JavaScript",
                        nota: 4.2,
                        branchs: 1
                    }} />
                </div>
            </div>
            <div className="w-full mt-4">
                <h1 className="my-4 text-2xl text-slate-300 mb-4 flex space-x-3"><i className="bi bi-layer-forward"></i><p>Pipelines Recentes</p></h1>
                <Table1 />
            </div>
        </div>
    );
}
