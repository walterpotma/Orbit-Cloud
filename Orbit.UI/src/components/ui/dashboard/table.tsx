"use client"
import { Dot, GitCommit, RotateCw, Trash } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";

type tableProps = {

}

export default function Table({ }) {
    const [filter, setFilter] = useState(0);
    const imagens = [
        { id: 1, status: 1, image: "TesteJs", commit: "Projeto-teste-js", branch: "main", duration: "3m 42s" },
        { id: 2, status: 3, image: "TestePython", commit: "Projeto-teste-python", branch: "dev", duration: "5m 10s" },
        { id: 3, status: 2, image: "TesteGo", commit: "Projeto-teste-go", branch: "feature-x", duration: "2m 30s" }
    ]
    const status = [
        "Todas",
        "Sucesso",
        "Falhou",
        "Rodando",
        "Pendente"
    ];

    const filteredImage = filter === 0 ? imagens : imagens.filter(img => img.status === filter);    

    return (
        <div className="w-full mb-4 bg-slate-800 rounded-xl">
            <div className="w-full py-4 px-8 flex justify-between items-center space-x-4">
                <h1>Atividade das Pipelines</h1>
                <nav className="min-w-60 flex justify-center items-center space-x-4">
                    <button onClick={() => setFilter(0)} className={`px-2 py-1 rounded-md hover:bg-slate-700 hover:text-blue-400 cursor-pointer transition ease-in-out duration-200 ${filter == 0 ? "bg-slate-700 text-blue-400" : "text-slate-300"}`}>Todas</button>
                    <button onClick={() => setFilter(1)} className={`px-2 py-1 rounded-md hover:bg-slate-700 hover:text-blue-500 cursor-pointer transition ease-in-out duration-200 ${filter == 1 ? "bg-slate-700 text-blue-400" : "text-slate-300"}`}>Sucesso</button>
                    <button onClick={() => setFilter(2)} className={`px-2 py-1 rounded-md hover:bg-slate-700 hover:text-blue-500 cursor-pointer transition ease-in-out duration-200 ${filter == 2 ? "bg-slate-700 text-blue-400" : "text-slate-300"}`}>Falhou</button>
                    <button onClick={() => setFilter(3)} className={`px-2 py-1 rounded-md hover:bg-slate-700 hover:text-blue-500 cursor-pointer transition ease-in-out duration-200 ${filter == 4 ? "bg-slate-700 text-blue-400" : "text-slate-300"}`}>Rodando</button>
                </nav>
            </div>
            <div className="w-full p-4 bg-slate-900 border-t border-slate-700 text-slate-400 flex justify-around items-center space-x-4">
                <span className="w-20 flex justify-center">Status</span>
                <span className="w-20 flex justify-center">Image</span>
                <span className="w-20 flex justify-center">Commit</span>
                <span className="w-20 flex justify-center">Branch</span>
                <span className="w-20 flex justify-center">Duração</span>
                <span className="w-20 flex justify-center">Ações</span>
            </div>

            <div className="w-full">
                {filteredImage.map((image, index) => (
                    <div className="w-full p-4 border-t border-slate-700 flex justify-around items-center space-x-4">
                        <span className="w-40 text-sm flex justify-center items-center space-x-2">
                            <div className="w-18 flex justify-start items-center space-x-2">
                                <i className="bi bi-circle-fill text-green-400 text-xs"></i>
                                <p>{status[image.status]}</p>
                            </div>
                        </span>
                        <span className="w-40 text-sm flex justify-center items-center space-x-2">
                            <p>{image.image}</p>
                        </span>
                        <span className="w-40 text-sm flex justify-center items-center space-x-2">
                            <GitCommit />
                            <p>{image.commit}</p>
                        </span>
                        <span className="w-40 text-sm flex justify-center items-center space-x-2">
                            <p>{image.branch}</p>
                        </span>
                        <span className="w-40 text-sm flex justify-center items-center space-x-2">
                            <p>{image.duration}</p>
                        </span>
                        <div className="w-40 text-sm flex justify-center items-center space-x-2">
                            <button className="hover:text-blue-500 cursor-pointer transition ease-in-out duration-200">
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                            <button className="hover:text-red-500 cursor-pointer transition ease-in-out duration-200">
                                <i className="bi bi-trash-fill"></i>
                            </button>
                            <button className="hover:text-green-500 cursor-pointer transition ease-in-out duration-200">
                                <i className="bi bi-eye-fill"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}