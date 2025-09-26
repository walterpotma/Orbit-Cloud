"use client";
import { Circle, Sparkle } from "lucide-react";

export default function Loading() {
    return (
        <div className={`position fixed w-full h-screen flex justify-center items-center bg-black/70`}>
            <span className="position relative">
                <i className="position absolute -top-3 -right-2 animate-bounce"><Sparkle className="text-yellow-200 animate-pulse" /></i>
                <div className="absolute top-0.5 -left-2 z-1000 w-23 h-13 rounded-t-full border-10 border-b-0 rotate-340  border-blue-400"></div>
                <div className="w-23 h-23 rounded-full border-10 border-blue-400 animate-pulse"></div>
                <span className="position absolute text-white flex">
                    <p className="flex items-center text-white space-x-1">
                        <span>Carregando</span>
                        <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                        <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                        <span className="animate-bounce">.</span>
                    </p>
                </span>
            </span>
            <i className="position absolute rotate-340 w-40 h-10 rounded-[50%] border-11 border-transparent anel-gradiente"></i>
        </div>
    );
}