"use client"
import { useState, useEffect, ReactNode } from "react";

export type CardProps = {
    title: string;
    data: string[];
    className?: string;
}

export default function Card({ }) {
    return (
        <div className="w-sm bg-slate-800 rounded-xl">
            <div className="p-4 border-b border-slate-600">
                <img src="" alt="" />
                <div>
                    <h1>Title</h1>
                    <h2></h2>
                </div>
            </div>
            <div className="p-4">
                <div className="text-slate-500 flex justify-start items-center space-x-2">
                    <p>tecnologia</p>
                    <p>nota</p>
                    <p>branchs</p>
                </div>
                <div>
                    <button>Rodar Pipeline</button>
                    <button>config</button>
                </div>
            </div>
        </div>
    );
} 