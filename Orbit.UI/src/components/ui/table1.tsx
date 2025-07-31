"use client"
import { Dot, GitCommit, RotateCw, Trash } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";

type tableProps = {
    
}

export default function Table ({}) {
    return (
        <div className="w-full bg-slate-800 rounded-xl">
            <div className="w-full py-4 px-8 flex justify-between items-center space-x-4">
                <h1>Atividade das Pipelines</h1>
                <nav className="min-w-60 flex justify-center items-center space-x-4">
                    <button>Todas</button>
                    <button>Sucesso</button>
                    <button>Falhou</button>
                    <button>Rodando</button>
                </nav>
            </div>
            <div className="w-full p-4 bg-slate-900 border-t border-slate-700 text-slate-400 flex justify-around items-center space-x-4">
                <p>Status</p>
                <p>Pipeline</p>
                <p>Commit</p>
                <p>Branch</p>
                <p>Duração</p>
                <p>Ações</p>
            </div>
            <div>
                <div>
                    <span>
                        <i className="bi bi-circle-fill text-green-400"></i>
                        <p>Sucesso</p>
                    </span>
                    <p><GitCommit/>Projeto-teste-js</p>
                    <p>main</p>
                    <p>3m 42s</p>
                    <div>
                        <i className="bi bi-arrow-clockwise"></i>
                        <i className="bi bi-trash-fill"></i>
                        <i className="bi bi-eye-fill"></i>
                    </div>
                </div>
            </div>
        </div>
    );
}