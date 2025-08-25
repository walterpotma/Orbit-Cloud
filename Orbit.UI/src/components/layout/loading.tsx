"use client";

import { Circle, Sparkle } from "lucide-react";

export default function Loading() {
    return (
        <div className="position fixed w-full h-screen flex justify-center items-center bg-black/70">
            <span className="position relative">
                <Sparkle className="position absolute -top-4 -right-2 text-yellow-200 animate-pulse" />
                <Circle size={100} className="text-blue-500" />
                <span className="position absolute text-white flex">
                    <p className="flex items-center text-white space-x-1">
                        <span>Carregando</span>
                        <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                        <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                        <span className="animate-bounce">.</span>
                    </p>
                </span>
            </span>
            <i className="position absolute rotate-340 w-40 h-10 rounded-[50%] border-8 border-t-0 border-yellow-200 animate-pulse"></i>
        </div>
    );
}