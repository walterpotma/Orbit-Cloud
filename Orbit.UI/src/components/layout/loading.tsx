"use client";
import { Circle, Sparkle } from "lucide-react";
import { useState } from "react";

export default function Loading() {

    return (
        <div className={`position fixed w-full h-screen flex justify-center items-center bg-black/70`}>
            <span className="position relative">
                <i className="position absolute -top-3 -right-2 animate-bounce"><Sparkle className="text-yellow-200 animate-pulse" /></i>
                <div className="absolute top-0.5 -left-2 z-1000 w-23 h-13 rounded-t-full border-10 border-b-0 rotate-340  border-blue-400"></div>
                {/* <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="10" />
                </svg> */}
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