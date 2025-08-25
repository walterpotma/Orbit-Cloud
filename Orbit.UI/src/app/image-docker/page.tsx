"use client"
import { Database, GitBranch, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import 'devicon/devicon.min.css';
import BtnRefresh from "@/components/ui/BtnRefresh";

export default function Page() {
    const [filter, setFilter] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const status = ["", "Ativo", "Inativo"];
    const imagensDocker = [
        { id: 1, name: "nginx", tag: "1.25", size: "23MB", created: "2h ago", status: 1 },
        { id: 2, name: "node", tag: "18-alpine", size: "45MB", created: "1h ago", status: 1 },
        { id: 3, name: "postgres", tag: "15", size: "110MB", created: "30m ago", status: 1 },
        { id: 4, name: "redis", tag: "7", size: "32MB", created: "10m ago", status: 2 },
        { id: 5, name: "mongo", tag: "6", size: "130MB", created: "20m ago", status: 1 },
        { id: 6, name: "python", tag: "3.11-slim", size: "55MB", created: "1h ago", status: 1 },
        { id: 7, name: "dotnet", tag: "8.0-sdk", size: "190MB", created: "3h ago", status: 2 },
        { id: 8, name: "golang", tag: "1.21", size: "82MB", created: "5h ago", status: 1 },
        { id: 9, name: "ubuntu", tag: "22.04", size: "29MB", created: "4h ago", status: 2 },
        { id: 10, name: "alpine", tag: "latest", size: "5MB", created: "6h ago", status: 1 },
        { id: 11, name: "mysql", tag: "8", size: "140MB", created: "8h ago", status: 1 },
        { id: 12, name: "traefik", tag: "v2.10", size: "68MB", created: "7h ago", status: 1 },
        { id: 13, name: "httpd", tag: "2.4", size: "53MB", created: "2h ago", status: 2 },
        { id: 14, name: "busybox", tag: "latest", size: "1MB", created: "9h ago", status: 1 },
        { id: 15, name: "nextcloud", tag: "27", size: "780MB", created: "15m ago", status: 1 }
    ];


    const filtered = imagensDocker.filter((repo) => {
        const matchesStatus = filter === 0 || repo.status === filter;
        const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Imagem Docker</h1>
                    <div className="flex justify-center items-center space-x-3">
                        <button className="px-4 py-2 rounded-lg border-2 bg-blue-500 border-blue-500 text-sm text-white cursor-pointer hover:bg-blue-400 transition ease-in-out duration-200"> + Add Imagem</button>
                        <BtnRefresh />
                    </div>
                </div>
                <div className="w-full flex justify-between items-center my-4">
                    <div className="w-60 py-2 px-4 rounded-lg bg-slate-800 flex justify-between items-center">
                        <input
                            type="text"
                            placeholder="Pesquisar Imagens..."
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
                        <span className="w-40 flex justify-start items-start">Nome</span>
                        <span className="w-20 flex justify-center items-start">Image</span>
                        <span className="w-20 flex justify-center items-start">Tamanho</span>
                        <span className="w-20 flex justify-center items-start">criado</span>
                        <span className="w-20 flex justify-center items-start">Status</span>
                        <span className="w-20 flex justify-center items-start">Ações</span>
                    </div>
                    <div className="w-full pb-4 rounded-b-2xl bg-slate-800">
                        {paginated.map((img, index) => (
                            <div className="w-full">
                                <div className="w-full p-2 border-t border-slate-700 flex justify-around items-center space-x-4">
                                    <span className="w-40 flex justify-start items-center space-x-2">
                                        <i className="devicon-javascript-plain p-2 rounded-full bg-blue-600 text-white text-xl"></i>
                                        <p>{img.name}</p>
                                    </span>
                                    <span className="w-20 flex justify-start items-center space-x-2">
                                        <i className="bi bi-circle-fill text-green-400 text-xs"></i>
                                        <p>{img.tag}</p>
                                    </span>
                                    <span className="w-20 flex justify-center items-center space-x-2">
                                        <Database size={16} />
                                        <p>{img.size}</p>
                                    </span>
                                    <span className="w-20 flex justify-center items-center space-x-2">{img.created}</span>
                                    <span className={`w-20 px-2 py-1 rounded-md ${img.status == 1 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"}  flex justify-center items-center space-x-2`}>{status[img.status]}</span>
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