"use client"
import { useState, useEffect, ReactNode } from "react";
import Logo from "@/components/layout/logo";
import "bootstrap-icons/font/bootstrap-icons.css";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/layout/loading";

export default function header () {
    const pathUrl = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const navigationTo = (url: string) => {
        setLoading(true);
        setTimeout(() => {
            router.push(url);
        }, 50);
    }
    useEffect(() => {
        setLoading(false);
    }, [pathUrl]);
    
    return (
        <header className={`${pathUrl == "/login" || pathUrl == "/register" ? "hidden" : ""} w-full px-0 pr-5 py-0 border-b border-slate-700 flex justify-between items-center bg-[var(--dark)] `}>
            <h1 className="flex justify-center items-center space-x-2"><Logo /><p className="text-blue-500 text-3xl font-bold transform -translate-x-5">Cloud</p></h1>
            <nav>
                <a href=""></a>
            </nav>
            <div className="space-x-3">
                <button onClick={() => navigationTo("/deploy")} className="px-5 py-2 rounded-lg border-2 bg-blue-500 border-blue-500 text-white cursor-pointer"><i className="bi bi-rocket-takeoff-fill mr-2"></i>Deploy</button>
            </div>

            {loading && <div className="position fixed top-0 left-0"><Loading /></div>}
        </header>
    );
}