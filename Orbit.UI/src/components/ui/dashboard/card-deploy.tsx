"use client";
import { useState, useEffect, ReactNode } from "react";

type cardProps = {
    title: string;
    subTittle: string;
    metrics: number[];
    className?: string;
}

export default function Card({ title, metrics, subTittle, className }: cardProps) {
    return (
        <div className={`w-full p-5 bg-slate-800 rounded-xl flex flex-col justify-start items-start gap-4 ${className}}`}>
            <div className="w-full flex justify-between gap-3">
                <div className="px-5 py-1.5 rounded-xl bg-blue-700 flex justify-center items-center">
                    <i className="bi bi-box"></i>
                </div>
                <div className="w-full">
                    <h1 className="text-lg">{title}</h1>
                    <h1 className="text-md text-slate-400">Status</h1>
                </div>
            </div>
            <div className="w-full">
                {metrics.map((value, index) => (
                    <div className="w-full rounded-full bg-slate-700">
                        <p key={index} className={`py-1 mt-2 bg-blue-500 rounded-full`} style={{ width: `${value}%` }}></p>
                    </div>
                ))}
            </div>
            <p className="text-sm text-slate-400 mt-1">{subTittle}</p>
        </div>
    );
}