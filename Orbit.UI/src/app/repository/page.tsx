"use client"
import { RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";

export default function Page() {
    const [filter, setFilter] = useState(0);

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Repositórios</h1>
                    <div className="flex justify-center items-center space-x-3">
                        <button className="py-2 px-4 rounded-lg text-blue-500 text-sm border border-blue-600 flex justify-center items-center space-x-2 cursor-pointer hover:bg-blue-600/20 transition ease-in-out duration-200"><p>Refresh</p> <RefreshCcw size={16} /></button>
                        <button className="px-4 py-2 rounded-lg border-2 bg-blue-500 border-blue-500 text-sm text-white cursor-pointer hover:bg-blue-400 transition ease-in-out duration-200"> + Add Repositório</button>
                    </div>
                </div>
                <div className="w-full flex justify-between items-center my-8">
                    <div className="w-60 py-2 px-4 rounded-lg bg-slate-800 flex justify-between items-center">
                        <input type="text" name="" placeholder="Pesquisar repositórios..." id="" />
                        <i className="bi bi-search"></i>
                    </div>
                    <nav className="flex justify-center items-center space-x-4">
                        <button onClick={() => setFilter(0)} className={`px-3 py-2 rounded-lg ${filter == 0 ? "bg-slate-800 text-blue-400" : "text-slate-300"} cursor-pointer transition ease-in-out duration-200 hover:bg-slate-800 hover:text-blue-400`}>Todos</button>
                        <button onClick={() => setFilter(1)} className={`px-3 py-2 rounded-lg ${filter == 1 ? "bg-slate-800 text-blue-400" : "text-slate-300"} cursor-pointer transition ease-in-out duration-200 hover:bg-slate-800 hover:text-blue-400`}>Conectados</button>
                        <button onClick={() => setFilter(2)} className={`px-3 py-2 rounded-lg ${filter == 2 ? "bg-slate-800 text-blue-400" : "text-slate-300"} cursor-pointer transition ease-in-out duration-200 hover:bg-slate-800 hover:text-blue-400`}>Inativo</button>
                        <button onClick={() => setFilter(3)} className={`px-3 py-2 rounded-lg ${filter == 3 ? "bg-slate-800 text-blue-400" : "text-slate-300"} cursor-pointer transition ease-in-out duration-200 hover:bg-slate-800 hover:text-blue-400`}>Ativo</button>
                    </nav>
                </div>
                <div>
                    <div className="w-full p-4 rounded-t-2xl bg-slate-900 text-slate-400 flex justify-around items-center space-x-4">
                        <span className="w-40 flex justify-start">Repositório</span>
                        <span className="w-20 flex justify-center">tecnologia</span>
                        <span className="w-20 flex justify-center">Branch</span>
                        <span className="w-20 flex justify-center">Ultima Run</span>
                        <span className="w-20 flex justify-center">Status</span>
                        <span className="w-20 flex justify-center">Ações</span>
                    </div>
                    <div className="w-full pb-4 rounded-b-2xl bg-slate-800">
                        <div className="w-full p-4 border-t border-slate-700 flex justify-around items-center space-x-4">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <div className="w-40 text-sm flex justify-center items-center space-x-2">
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
                </div>
            </div>
        </div>
    );
}