"use client"
import { GitBranch } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import 'devicon/devicon.min.css';

export type CardData = {
  icone: ReactNode;
  title: string;
  tecnologia: string
  nota: number;
  branchs: number;
};

export type CardProps = {
  data: CardData;
  className?: string;
};
export default function Card({data}: CardProps) {
    return (
        <div className="w-full bg-slate-800 rounded-xl">
            <div className="p-4 border-b border-slate-600 flex justify-start items-center">
                <p className="w-12 h-12 px-2 py-2 mr-2 rounded-full bg-blue-600 text-2xl flex justify-center items-center">{data.icone}</p>
                <div>
                    <h1 className="text-xl font-bold">{data.title}</h1>
                    <h2 className="text-sm text-slate-400 flex justify-start items-center space-x-1"><GitBranch size={16} /> <p>Branch Main</p></h2>
                </div>
            </div>
            <div className="p-4 pt-2">
                <div className="text-slate-400 text-sm flex justify-start items-center space-x-5">
                    <div className="flex justify-center items-center space-x-1">
                        <i className="bi bi-code-slash"></i>
                        <p>{data.tecnologia}</p>
                    </div>
                    <div className="flex justify-center items-center space-x-1">
                        <i className="bi bi-star-fill"></i>
                        <p>{data.nota}</p>
                    </div>
                    <div className="flex justify-center items-center space-x-1">
                        <GitBranch size={16} />
                        <p>{data.branchs}</p>
                    </div>
                </div>
                <div className="w-full mt-2 flex justify-start items-center space-x-2">
                    <button className="px-4 py-1.5 rounded-sm bg-blue-600 text-white text-sm flex justify-center items-center space-x-2 cursor-pointer hover:bg-blue-500 transition ease-in-out duration-200">
                        <i className="bi bi-play-fill"></i>
                        <p>Deploy</p>
                    </button>
                    <button className="py-1 px-2 rounded-sm border border-blue-600 text-blue-600 cursor-pointer hover:bg-blue-600/20 transition ease-in-out duration-200">
                        <i className="bi bi-gear-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    );
} 