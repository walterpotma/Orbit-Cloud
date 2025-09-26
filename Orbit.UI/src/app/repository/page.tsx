"use client"
import { GitBranch, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import 'devicon/devicon.min.css';
import BtnRefresh from "@/components/ui/BtnRefresh";
import fileTree from "@/model/storage";
import SearchBar from "@/components/ui/table/search";

export default function Page() {
    const [filter, setFilter] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const status = ["N/A", "Ativo", "Inativo"];
    const filterOptions = ["Todos", "Ativos", "Inativos"];

    const repositorios = fileTree.filter(node => node.type === 'deploy' || node.type === 'folder' && node.branch != null);

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

    const selectIcon = (language: string | undefined) => {
        if (language === undefined) {
            return <i className="devicon-git-plain p-2 rounded-full bg-blue-500 text-2xl"></i>;
        }
        var iconName = language.toLowerCase();

        switch (iconName) {
            case 'html':
                iconName = 'html5';
                console.log(iconName);
                break;
            case 'css':
                iconName = 'css3';
                break;
        }
        return <i className={`devicon-${iconName}-plain p-2 rounded-full bg-blue-500 text-2xl`}></i>;
    }

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
                <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} filter={{ options: filterOptions, activeFilter: filter, onFilterChange: setFilter }} />
                <div>
                    <div className="w-full p-4 rounded-t-2xl bg-slate-900 text-slate-400 flex justify-around items-center space-x-4">
                        <span className="w-40 flex justify-start items-start">Repositório</span>
                        <span className="w-20 flex justify-center items-start">Linguagem</span>
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
                                        {selectIcon(repos.language)}
                                        <p>{repos.name}</p>
                                    </span>
                                    <span className="w-20 flex justify-start items-center space-x-2">
                                        <i className={`bi bi-circle-fill ${repos.status == 1 ? "text-green-400" : "text-red-400"} text-xs`}></i>
                                        <p>{repos.language ?? "N/A"}</p>
                                    </span>
                                    <span className="w-20 flex justify-center items-center space-x-2">
                                        <GitBranch size={16} />
                                        <p>{repos.branch}</p>
                                    </span>
                                    <span className="w-20 flex justify-center items-center space-x-2">{"N/A"}</span>
                                    <span className={`w-20 px-2 py-1 rounded-md ${repos.status == 1 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"}  flex justify-center items-center space-x-2`}>{status[repos.status ?? 0]}</span>
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