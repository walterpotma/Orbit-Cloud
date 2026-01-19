"use client"
import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import "bootstrap-icons/font/bootstrap-icons.css"
import Loading from "@/components/layout/loading";
import Button from "@/components/ui/layout/btn-navigation";

export default function Nav() {
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
            <Button text="Dashboard" icon="grid-1x2-fill" onClick={() => navigationTo('/')} active={pathUrl === '/'}/>
            {/* <Button text="Repositórios" icon="box-seam-fill" onClick={() => navigationTo('/repository')} active={pathUrl === '/repository'}/> */}
            <Button text="Deploys" icon="rocket-takeoff-fill" onClick={() => navigationTo('/deploy')} active={pathUrl === '/deploy'}/>
            <Button text="Rede" icon="globe2" onClick={() => navigationTo('/network')} active={pathUrl === '/network'}/>
            {/* <Button text="Segredos" icon="shield-lock-fill" onClick={() => navigationTo('/secrets')} active={pathUrl === '/secrets'}/> */}
            <Button text="Variaveis" icon="intersect" onClick={() => navigationTo('/variables')} active={pathUrl === '/variables'}/>
            {/* <Button text="Armazenamento" icon="folder-fill" onClick={() => navigationTo('/storage')} active={pathUrl === '/storage'}/> */}
            {/* <Button text="Planos" icon="award-fill" onClick={() => navigationTo('/subscriptions')} active={pathUrl === '/subscriptions'}/> */}
            {/* <Button text="Configurações" icon="gear-fill" onClick={() => navigationTo('/settings')} active={pathUrl === '/settings'}/> */}
            {/* <Button text="Suporte" icon="life-preserver" onClick={() => navigationTo('/support')} active={pathUrl === '/support'}/> */}

            {loading && <div className="position fixed top-0 left-0"><Loading /></div>}
        </nav>
    );
}