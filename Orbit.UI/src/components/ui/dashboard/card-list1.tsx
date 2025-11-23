"use client";
import { useState, useEffect, ReactNode } from "react";

type cardProps = {
    title: string;
    subTittle?: string;
    metrics: number[];
    className?: string;
}

export default function Card ({title, metrics, subTittle, className}: cardProps) {
    return (
        <div className={`w-full p-5 bg-slate-800 rounded-xl border-l-4 border-blue-500 ${className}}`}>
            <div className="w-full flex justify-between">
                <h1 className="text-md text-slate-400">{title}</h1>
                <h1>Usage</h1>
            </div>
            {metrics.map((value, index) => (
                <div className="w-full rounded-full bg-slate-700 outline-1 outline-slate-600">
                    <p key={index} className={`py-1 mt-2 bg-blue-500 rounded-full`} style={{ width: `${value}%` }}></p>
                </div>
            ))}
            <p className="text-sm text-slate-400 mt-1">{subTittle}</p>
        </div>
    );
}