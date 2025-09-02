"use client"
import { LayoutDashboard } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import "bootstrap-icons/font/bootstrap-icons.css"
import { useRouter, usePathname } from "next/navigation";
import Loading from "@/components/layout/loading";

export default function Nav() {
    const router = useRouter();
    const pathUrl = usePathname();
    const [loading, setLoading] = useState(true);

    const navigationTo = (url: string) => {
        setLoading(true);
        setTimeout(() => {
            router.push(url);
        }, 50);
    }
    useEffect(() => {
        setLoading(true);
    }, [pathUrl]);
    
    return (
        <nav className={`${pathUrl == "/login" || pathUrl == "/register" ? "hidden" : ""} w-74 pt-5 h-full bg-[var(--dark)]`}>
            <button onClick={() => navigationTo('/')} className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${pathUrl === '/' ? 'bg-slate-800 text-blue-500 border-l-2' : 'text-slate-400'}`}>
                <i className="bi bi-grid-1x2-fill mr-2 text-lg"></i>
                Dashboard
            </button>
            <button onClick={() => navigationTo('/repository')} className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${pathUrl === '/repository' ? 'bg-slate-800 text-blue-500 border-l-2' : 'text-slate-400'}`}>
                <i className="bi bi-box-seam-fill mr-2 text-lg"></i>
                Repositórios
            </button>
            <button onClick={() => navigationTo('/image-docker')} className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${pathUrl === '/image-docker' ? 'bg-slate-800 text-blue-500 border-l-2' : 'text-slate-400'}`}>
                <i className="bi bi-layer-forward mr-2 text-lg"></i>
                Image Docker
            </button>
            <button onClick={() => navigationTo('/deploy')} className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${pathUrl === '/deploy' ? 'bg-slate-800 text-blue-500 border-l-2' : 'text-slate-400'}`}>
                <i className="bi bi-rocket-takeoff-fill mr-2 text-lg"></i>
                Deploys
            </button>
            <button onClick={() => navigationTo('/analytics')} className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${pathUrl === '/analytics' ? 'bg-slate-800 text-blue-500 border-l-2' : 'text-slate-400'}`}>
                <i className="bi bi-clipboard-data-fill mr-2 text-lg"></i>
                Análises
            </button>
            <button onClick={() => navigationTo('/settings')} className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${pathUrl === '/settings' ? 'bg-slate-800 text-blue-500 border-l-2' : 'text-slate-400'}`}>
                <i className="bi bi-gear-fill mr-2 text-lg"></i>
                Configurações
            </button>
            <button onClick={() => navigationTo('/support')} className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${pathUrl === '/support' ? 'bg-slate-800 text-blue-500 border-l-2' : 'text-slate-400'}`}>
                <i className="bi bi-life-preserver mr-2 text-lg"></i>
                Suporte
            </button>

            {loading && <div className="position fixed top-0 left-0"><Loading /></div>}
        </nav>
    );
}