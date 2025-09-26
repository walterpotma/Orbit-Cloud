"use client"
import { useState, useEffect, ReactNode } from "react"

type cardProps = {
    title: string;
    value: number;
    analysis: string;
    className?: string;
}

export default function Card ({title, value, analysis, className}: cardProps) {
    return (
        <div className={`w-full p-5 bg-slate-800 rounded-xl border-l-4 border-blue-500 ${className}}`}>
            <h1 className="text-md text-slate-400">{title}</h1>
            <p className="text-2xl font-bold mt-2">{value}</p>
            <p className="text-sm text-slate-400 mt-1">{analysis}</p>
        </div>
    );
}