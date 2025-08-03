"use client"
import { Dot, GitCommit, RotateCw, Trash } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";

type tableProps = {
    
}

export default function Table ({}) {
    const [filter, setFilter] = useState(0);

    return (
        <div className="w-full mb-4 bg-slate-800 rounded-xl">
            <div className="w-full py-4 px-8 flex justify-between items-center space-x-4">
                <h1>Atividade das Pipelines</h1>
                <nav className="min-w-60 flex justify-center items-center space-x-4">
                    <button className={`px-2 py-1 rounded-md hover:bg-slate-700 hover:text-blue-500 cursor-pointer transition ease-in-out duration-200 ${filter == 0 ? "bg-slate-700 text-blue-500" : "text-slate-300"}`}>Todas</button>
                    <button className={`px-2 py-1 rounded-md hover:bg-slate-700 hover:text-blue-500 cursor-pointer transition ease-in-out duration-200 ${filter == 1 ? "bg-slate-700 text-blue-500" : "text-slate-300"}`}>Sucesso</button>
                    <button className={`px-2 py-1 rounded-md hover:bg-slate-700 hover:text-blue-500 cursor-pointer transition ease-in-out duration-200 ${filter == 2 ? "bg-slate-700 text-blue-500" : "text-slate-300"}`}>Falhou</button>
                    <button className={`px-2 py-1 rounded-md hover:bg-slate-700 hover:text-blue-500 cursor-pointer transition ease-in-out duration-200 ${filter == 4 ? "bg-slate-700 text-blue-500" : "text-slate-300"}`}>Rodando</button>
                </nav>
            </div>
            <div className="w-full p-4 bg-slate-900 border-t border-slate-700 text-slate-400 flex justify-around items-center space-x-4">
                <span className="w-20 flex justify-center">Status</span>
                <span className="w-20 flex justify-center">Pipeline</span>
                <span className="w-20 flex justify-center">Commit</span>
                <span className="w-20 flex justify-center">Branch</span>
                <span className="w-20 flex justify-center">Duração</span>
                <span className="w-20 flex justify-center">Ações</span>
            </div>
            <div className="w-full">
                <div className="w-full p-4 border-t border-slate-700 flex justify-around items-center space-x-4">
                    <span className="w-40 text-sm flex justify-center items-center space-x-2">
                        <i className="bi bi-circle-fill text-green-400 text-xs"></i>
                        <p>Sucesso</p>
                    </span>
                    <span className="w-40 text-sm flex justify-center items-center space-x-2">
                        <p>TesteJs</p>
                    </span>
                    <span className="w-40 text-sm flex justify-center items-center space-x-2">
                        <GitCommit/>
                        <p>Projeto-teste-js</p>
                    </span>
                    <span className="w-40 text-sm flex justify-center items-center space-x-2">
                        <p>main</p>
                    </span>
                    <span className="w-40 text-sm flex justify-center items-center space-x-2">
                        <p>3m 42s</p>
                    </span>
                    <div className="w-40 text-sm flex justify-center items-center space-x-2">
                        <i className="bi bi-arrow-clockwise"></i>
                        <i className="bi bi-trash-fill"></i>
                        <i className="bi bi-eye-fill"></i>
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className="w-full p-4 border-t border-slate-700 flex justify-around items-center space-x-4">
                    <span className="w-40 text-sm flex justify-center items-center space-x-2">
                        <i className="bi bi-circle-fill text-green-400 text-xs"></i>
                        <p>Sucesso</p>
                    </span>
                    <span className="w-40 text-sm flex justify-center items-center space-x-2">
                        <p>TesteJs</p>
                    </span>
                    <span className="w-40 text-sm flex justify-center items-center space-x-2">
                        <GitCommit/>
                        <p>Projeto-teste-js</p>
                    </span>
                    <span className="w-40 text-sm flex justify-center items-center space-x-2">
                        <p>main</p>
                    </span>
                    <span className="w-40 text-sm flex justify-center items-center space-x-2">
                        <p>3m 42s</p>
                    </span>
                    <div className="w-40 text-sm flex justify-center items-center space-x-2">
                        <i className="bi bi-arrow-clockwise"></i>
                        <i className="bi bi-trash-fill"></i>
                        <i className="bi bi-eye-fill"></i>
                    </div>
                </div>
            </div>
        </div>
    );
}