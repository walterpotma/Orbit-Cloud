"use client"
import { GitBranch, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import 'devicon/devicon.min.css';
import BtnRefresh from "@/components/ui/BtnRefresh";

export default function Page() {
    const [filter, setFilter] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const status = ["", "Ativo", "Inativo"];
    const [repositorios, setRepositorios] = useState([
        { id: 1, name: "Projeto-teste-js", technology: "JavaScript", branch: "main", lastRun: "2h ago", status: 1 },
        { id: 2, name: "WebApi-teste", technology: "C#", branch: "develop", lastRun: "1h ago", status: 2 },
        { id: 3, name: "ApiFlask-teste", technology: "Python", branch: "master", lastRun: "30m ago", status: 1 },
        { id: 4, name: "FrontEnd-Next", technology: "JavaScript", branch: "main", lastRun: "10m ago", status: 1 },
        { id: 5, name: "BackEnd-NodeJS", technology: "JavaScript", branch: "develop", lastRun: "20m ago", status: 2 },
        { id: 6, name: "API-NestJS", technology: "TypeScript", branch: "main", lastRun: "1h ago", status: 1 },
        { id: 7, name: "Sistema-ERP", technology: "C#", branch: "release", lastRun: "3h ago", status: 1 },
        { id: 8, name: "AutomacaoPython", technology: "Python", branch: "main", lastRun: "5h ago", status: 2 },
        { id: 9, name: "Script-Bash", technology: "Shell", branch: "main", lastRun: "4h ago", status: 1 },
        { id: 10, name: "Site-Institucional", technology: "HTML", branch: "master", lastRun: "6h ago", status: 1 },
        { id: 11, name: "Painel-Admin", technology: "Vue.js", branch: "develop", lastRun: "8h ago", status: 2 },
        { id: 12, name: "Mobile-App", technology: "Dart", branch: "main", lastRun: "7h ago", status: 1 },
        { id: 13, name: "Microservico-Auth", technology: "Go", branch: "develop", lastRun: "2h ago", status: 1 },
        { id: 14, name: "Service-Java", technology: "Java", branch: "main", lastRun: "9h ago", status: 2 },
        { id: 15, name: "DashBoard-Analytics", technology: "React", branch: "main", lastRun: "15m ago", status: 1 }
    ]);

    const filteredRepos = repositorios.filter((repo) => {
        const matchesStatus = filter === 0 || repo.status === filter;
        const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filteredRepos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRepos = filteredRepos.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Repositórios</h1>
                    <div className="flex justify-center items-center space-x-3">
                        <button className="px-4 py-2 rounded-lg border-2 bg-blue-500 border-blue-500 text-sm text-white cursor-pointer hover:bg-blue-400 transition ease-in-out duration-200"> + Add Repositório</button>
                        <BtnRefresh />
                    </div>
                </div>
                <div className="w-full flex justify-between items-center my-4">
                    <div className="w-60 py-2 px-4 rounded-lg bg-slate-800 flex justify-between items-center">
                        <input
                            type="text"
                            placeholder="Pesquisar repositórios..."
                            className="bg-transparent text-slate-200 outline-none w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <i className="bi bi-search"></i>
                    </div>
                    <nav className="flex justify-center items-center space-x-4">
                        <button onClick={() => setFilter(0)} className={`px-3 py-2 rounded-lg ${filter == 0 ? "bg-slate-800 text-blue-400" : "text-slate-300"} cursor-pointer transition ease-in-out duration-200 hover:bg-slate-800 hover:text-blue-400`}>Todos</button>
                        <button onClick={() => setFilter(1)} className={`px-3 py-2 rounded-lg ${filter == 1 ? "bg-slate-800 text-blue-400" : "text-slate-300"} cursor-pointer transition ease-in-out duration-200 hover:bg-slate-800 hover:text-blue-400`}>Ativos</button>
                        <button onClick={() => setFilter(2)} className={`px-3 py-2 rounded-lg ${filter == 2 ? "bg-slate-800 text-blue-400" : "text-slate-300"} cursor-pointer transition ease-in-out duration-200 hover:bg-slate-800 hover:text-blue-400`}>Inativos</button>
                    </nav>
                </div>
                <div>
                    <div className="w-full p-4 rounded-t-2xl bg-slate-900 text-slate-400 flex justify-around items-center space-x-4">
                        <span className="w-40 flex justify-start items-start">Repositório</span>
                        <span className="w-20 flex justify-center items-start">tecnologia</span>
                        <span className="w-20 flex justify-center items-start">Branch</span>
                        <span className="w-20 flex justify-center items-start">Ultima Run</span>
                        <span className="w-20 flex justify-center items-start">Status</span>
                        <span className="w-20 flex justify-center items-start">Ações</span>
                    </div>
                    <div className="w-full pb-4 rounded-b-2xl bg-slate-800">
                        {paginatedRepos.map((repos, index) => (
                            <div className="w-full">
                                <div className="w-full p-2 border-t border-slate-700 flex justify-around items-center space-x-4">
                                    <span className="w-40 flex justify-start items-center space-x-2">
                                        <i className="devicon-javascript-plain p-2 rounded-full bg-blue-600 text-white text-xl"></i>
                                        <p>{repos.name}</p>
                                    </span>
                                    <span className="w-20 flex justify-start items-center space-x-2">
                                        <i className="bi bi-circle-fill text-green-400 text-xs"></i>
                                        <p>{repos.technology}</p>
                                    </span>
                                    <span className="w-20 flex justify-center items-center space-x-2">
                                        <GitBranch size={16} />
                                        <p>{repos.branch}</p>
                                    </span>
                                    <span className="w-20 flex justify-center items-center space-x-2">{repos.lastRun}</span>
                                    <span className={`w-20 px-2 py-1 rounded-md ${repos.status == 1 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"}  flex justify-center items-center space-x-2`}>{status[repos.status]}</span>
                                    <div className="w-20 text-sm flex justify-center items-center space-x-2">
                                        <button className="hover:text-green-500 cursor-pointer transition ease-in-out duration-200">
                                            <i className="bi bi-eye-fill"></i>
                                        </button>
                                        <button className="hover:text-blue-500 cursor-pointer transition ease-in-out duration-200">
                                            <i className="bi bi-gear-fill"></i>
                                        </button>
                                        <button className="hover:text-red-500 cursor-pointer transition ease-in-out duration-200">
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="w-full flex justify-center items-center mt-6 space-x-4">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded bg-slate-700 text-white disabled:opacity-50 cursor-pointer"
                        >
                            Anterior
                        </button>
                        <span className="text-slate-400">Página {currentPage} de {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded bg-slate-700 text-white disabled:opacity-50 cursor-pointer"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}