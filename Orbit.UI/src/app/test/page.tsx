"use client";

import { Radius } from "lucide-react";

export default function Page() {
    return (
        <div className="w-full h-screen flex gap-4 justify-center items-center bg-slate-900 relative">
            {/* Círculo perfeito */}

            <div className="w-100 h-20 p-12 border-10 border-t-0 border-slate-800/90 absolute rounded-[50%] -rotate-30 z-20" />
            <div className="w-93 p-8 border-20 border-t-0 border-slate-800 absolute rounded-[50%] -translate-y-0.5 -rotate-30 z-20" />
            <div className="w-78 p-5 border-10 border-t-0 border-slate-800/90 absolute rounded-[50%] -translate-y-2 -rotate-30 z-20" />
            <div className="w-48 h-48 bg-blue-600 rounded-full absolute overflow-hidden z-10">

                <div
                    className="w-30 h-48 -translate-x- -translate-y-5 bg-blue-500 absolute rotate-45 rounded-[50%] z-30"
                />

            </div>
        </div>
    );
}