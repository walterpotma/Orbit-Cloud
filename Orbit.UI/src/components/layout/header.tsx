"use client"
import { useState, useEffect, ReactNode } from "react";
import Logo from "@/components/layout/logo";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function header () {
    return (
        <header className="w-full px-0 pr-5 py-0 border-b border-slate-700 flex justify-between items-center bg-[var(--dark)]">
            <h1 className="flex justify-center items-center space-x-2"><Logo /><p className="text-blue-500 text-3xl font-bold transform -translate-x-5">CI/CD</p></h1>
            <nav>
                <a href=""></a>
            </nav>
            <div className="space-x-3">
                <button className="px-5 py-2 rounded-lg border-2 border-blue-500 text-blue-400">+ Nova Pipeline</button>
                <button className="px-5 py-2 rounded-lg border-2 bg-blue-500 border-blue-500 text-white"><i className="bi bi-rocket-takeoff-fill mr-2"></i>Deploy</button>
            </div>
        </header>
    );
}