"use client"
import { LayoutDashboard } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Nav () {
    return (
        <nav className="w-60 h-full bg-[var(--dark)]">
            <button className="w-full py-4 px-10 text-slate-400 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500"><LayoutDashboard size={20} className="mr-1"/> Dashboard</button>
            <button className="w-full py-4 px-10 text-slate-400 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500"><LayoutDashboard size={20} className="mr-1"/> Dashboard</button>
            <button className="w-full py-4 px-10 text-slate-400 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500"><LayoutDashboard size={20} className="mr-1"/> Dashboard</button>
            <button className="w-full py-4 px-10 text-slate-400 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500"><LayoutDashboard size={20} className="mr-1"/> Dashboard</button>
            <button className="w-full py-4 px-10 text-slate-400 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500"><LayoutDashboard size={20} className="mr-1"/> Dashboard</button>
            <button className="w-full py-4 px-10 text-slate-400 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500"><LayoutDashboard size={20} className="mr-1"/> Dashboard</button>
            <button className="w-full py-4 px-10 text-slate-400 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500"><LayoutDashboard size={20} className="mr-1"/> Dashboard</button>
        </nav>
    );
}