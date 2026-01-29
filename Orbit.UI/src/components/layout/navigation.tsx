"use client"
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css"
import Loading from "@/components/layout/loading";
import Button from "@/components/ui/button-navigation";
import Logo from "@/components/layout/logo";
import { useUser } from "@/context/user";

export default function Nav() {
    const { UserData, isLoading } = useUser();
    const router = useRouter();
    const pathUrl = usePathname();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(true);
    const [width, setWidth] = useState(10);

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

    const toggleMenu = () => {
        setOpen(!open);
        setWidth(open ? 96 : 10);
    };

    return (
        <nav className={`${pathUrl == "/login" || pathUrl == "/register" ? "hidden" : ""} w-${width} min-w-${width} pt-5 h-full bg-[var(--dark)] flex flex-col relative transition duration-300 ease-in-out`}>
            <h1 className={`w-full flex justify-center items-center`}>
                <Logo />
                <p className={`text-3xl font-bold ${open ? "hidden" : ""}`}>Orbit</p>
                <p className={`text-blue-500 text-3xl font-bold transform ${open ? "hidden" : ""}`}>Cloud</p>
            </h1>
            <div className="h-full">
                <Button text="Dashboard" icon="grid-1x2-fill" open={open} onClick={() => navigationTo('/')} active={pathUrl === '/'} />
                {/* <Button text="Repositórios" icon="box-seam-fill" onClick={() => navigationTo('/repository')} active={pathUrl === '/repository'}/> */}
                <Button text="Versões" icon="intersect" open={open} onClick={() => navigationTo('/library')} active={pathUrl === '/library'} />
                <Button text="Deploys" icon="rocket-takeoff-fill" open={open} onClick={() => navigationTo('/deploy')} active={pathUrl === '/deploy'} />
                <Button text="Rede" icon="globe2" open={open} onClick={() => navigationTo('/network')} active={pathUrl === '/network'} />
                <Button text="Cofre" icon="shield-lock-fill" open={open} onClick={() => navigationTo('/vault')} active={pathUrl === '/vault'} />
                {/* <Button text="Armazenamento" icon="folder-fill" onClick={() => navigationTo('/storage')} active={pathUrl === '/storage'}/> */}
                {/* <Button text="Planos" icon="award-fill" onClick={() => navigationTo('/subscriptions')} active={pathUrl === '/subscriptions'}/> */}
                {/* <Button text="Configurações" icon="gear-fill" onClick={() => navigationTo('/settings')} active={pathUrl === '/settings'}/> */}
                {/* <Button text="Suporte" icon="life-preserver" onClick={() => navigationTo('/support')} active={pathUrl === '/support'}/> */}
            </div>

            <div className="w-full">
                {isLoading ? (
                    // Estado de Carregamento (Skeleton simples)
                    <div className="animate-pulse flex items-center space-x-3">
                        <div className="h-4 w-24 bg-slate-700 rounded"></div>
                        <div className="h-8 w-8 bg-slate-700 rounded-full"></div>
                    </div>
                ) : UserData ? (
                    <div className="w-full flex flex-col">
                        <div className="text-slate-500 flex justify-center items-center space-x-3 cursor-pointer hover:text-slate-300 transition-colors">
                            {UserData.avatar ? (
                                <img src={UserData.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-600" />

                            ) : (
                                <i className="bi bi-person-circle text-3xl"></i>
                            )}
                            <p className={`font-bold ${open ? "hidden" : ""} text-white`}>{UserData.name || UserData.username || "Usuário"}</p>
                        </div>
                        <Button text="Logout" icon="box-arrow-right" open={open} onClick={() => {
                            document.cookie = "orbit-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            navigationTo('/login');
                        }} active={false} />
                    </div>
                ) : (
                    <div className={`w-full flex justify-between ${open ? "flex-col" : ""}`}>
                        <Button text="Login" icon="door-open" open={open} onClick={() => navigationTo('/login')} active={pathUrl === '/login'} />
                        <button className={`px-4 flex justify-center text-2xl items-center text-blue-500 cursor-pointer`} onClick={toggleMenu}>
                            <i className={`bi bi-arrow-bar-${open ? "right" : "left"}`}></i>
                        </button>
                    </div>
                )}
            </div>

            {loading && <div className="position fixed top-0 left-0"><Loading /></div>}
        </nav>
    );
}