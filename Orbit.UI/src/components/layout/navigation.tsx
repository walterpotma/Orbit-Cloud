"use client"
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css"
import Loading from "@/components/layout/loading";
import Button from "@/components/ui/layout/btn-navigation";
import Logo from "@/components/layout/logo";
import { useUser } from "@/context/user";

export default function Nav() {
    const { UserData, isLoading } = useUser();
    const router = useRouter();
    const pathUrl = usePathname();
    const [loading, setLoading] = useState(false);
    const [newApp, setNewApp] = useState(false);


    const navigationTo = (url: string) => {
        setLoading(true);
        if (pathUrl === url) {
            setLoading(false);
            return;
        }
        setTimeout(() => {
            router.push(url);
        }, 50);
    };
    useEffect(() => {
        setLoading(false);
    }, [pathUrl]);

    return (
        <nav className={`${pathUrl == "/login" || pathUrl == "/register" ? "hidden" : ""} w-74 pt-5 h-full bg-[var(--dark)]`}>
            <h1 className="flex justify-center items-center space-x-2">
                <Logo />
                <p className="text-blue-500 text-3xl font-bold transform -translate-x-5">Cloud</p>
            </h1>
            <Button text="Dashboard" icon="grid-1x2-fill" onClick={() => navigationTo('/')} active={pathUrl === '/'} />
            {/* <Button text="Repositórios" icon="box-seam-fill" onClick={() => navigationTo('/repository')} active={pathUrl === '/repository'}/> */}
            <Button text="Deploys" icon="rocket-takeoff-fill" onClick={() => navigationTo('/deploy')} active={pathUrl === '/deploy'} />
            <Button text="Rede" icon="globe2" onClick={() => navigationTo('/network')} active={pathUrl === '/network'} />
            <Button text="Variaveis" icon="intersect" onClick={() => navigationTo('/variables')} active={pathUrl === '/variables'} />
            {/* <Button text="Armazenamento" icon="folder-fill" onClick={() => navigationTo('/storage')} active={pathUrl === '/storage'}/> */}
            {/* <Button text="Planos" icon="award-fill" onClick={() => navigationTo('/subscriptions')} active={pathUrl === '/subscriptions'}/> */}
            {/* <Button text="Configurações" icon="gear-fill" onClick={() => navigationTo('/settings')} active={pathUrl === '/settings'}/> */}
            {/* <Button text="Suporte" icon="life-preserver" onClick={() => navigationTo('/support')} active={pathUrl === '/support'}/> */}

            {isLoading ? (
                // Estado de Carregamento (Skeleton simples)
                <div className="animate-pulse flex items-center space-x-3">
                    <div className="h-4 w-24 bg-slate-700 rounded"></div>
                    <div className="h-8 w-8 bg-slate-700 rounded-full"></div>
                </div>
            ) : UserData ? (
                // Usuário Logado
                <div className="text-slate-500 flex items-center space-x-3 cursor-pointer hover:text-slate-300 transition-colors">
                    <p className="font-bold text-white">{UserData.name || UserData.username || "Usuário"}</p>
                    {UserData.avatar ? (
                        <img src={UserData.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-600" />
                    ) : (
                        <i className="bi bi-person-circle text-3xl"></i>
                    )}
                </div>
            ) : (
                <Button text="Login" icon="door-open" onClick={() => navigationTo('/login')} active={pathUrl === '/login'} />
            )}

            {loading && <div className="position fixed top-0 left-0"><Loading /></div>}
        </nav>
    );
}