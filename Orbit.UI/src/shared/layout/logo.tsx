"use client";

import { Radius } from "lucide-react";

type LogoProps = {
    classname?: string;
};

export default function Page({ classname = "w-full h-screen" }: LogoProps) {
    return (
        <div className={`flex justify-center items-center relative ${classname}`}>

            <div className="w-100 h-20 p-12 border-10 border-t-0 border-slate-800/90 absolute rounded-[50%] -rotate-20 z-20" />
            <div className="w-93 p-8 border-20 border-t-0 border-slate-800 absolute rounded-[50%] -translate-y-0.5 -rotate-20 z-20" />
            <div className="w-78 p-5 border-10 border-t-0 border-slate-800/90 absolute rounded-[50%] -translate-y-2 -rotate-20 z-20" />
            <div className="w-48 h-48 bg-blue-600 rounded-full absolute overflow-hidden z-10">

                <div
                    className="w-30 h-48 -translate-x- -translate-y-5 bg-blue-500 absolute rotate-45 rounded-[50%] z-30"
                />

            </div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={50}
                height={50}
                viewBox="0 0 24 24"
                fill="none" // Começa sem preenchimento (só contorno)
                stroke="#FEF9C2" // A cor do contorno
                strokeWidth="1.5" // Espessura da linha
                strokeLinecap="round" // Pontas da linha arredondadas
                strokeLinejoin="round" // **Junção dos cantos arredondada** (Aqui está o segredo!)
                className="absolute translate-x-30 -translate-y-25 z-50 animate-pulse"
            >
                {/* O PATH CUSTOMIZADO: */}
                {/* Este path desenha a estrela com as pontas mais "puxadas" (afiadas) e o centro curvo. */}
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 7.92c.13 0 .262 0 .393 0a7.5 7.5 0 0 0-7.92 7.92c-.13 0-.26 0-.393 0a7.5 7.5 0 0 0-7.92-7.92c-.13 0-.263 0-.393 0a7.5 7.5 0 0 0 7.92-7.92Z" />
            </svg>
        </div>
    );
}