"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/user";
import Logo from "@/components/layout/logo";
import Loading from "@/components/layout/loading";
import {
    LayoutGrid,
    Layers,
    Rocket,
    Globe,
    Shield,
    HardDrive,
    LogOut,
    ChevronLeft,
    ChevronRight,
    UserCircle
} from "lucide-react";

// Configuração dos itens de menu para fácil manutenção
const NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: LayoutGrid, color: "blue-500" },
    { label: "Artefatos", href: "/artifacts", icon: Layers, color: "purple-500" },
    { label: "Deploys", href: "/deploy", icon: Rocket, color: "blue-500" },
    { label: "Rede", href: "/network", icon: Globe, color: "purple-500" },
    { label: "Cofre", href: "/vault", icon: Shield, color: "amber-500" },
    { label: "Armazenamento", href: "/storage", icon: HardDrive, color: "purple-500" }
];

export default function Nav() {
    const { UserData, isLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    // Controle de estado
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    // Reseta o loading ao mudar de rota
    useEffect(() => {
        setIsNavigating(false);
    }, [pathname]);

    const handleNavigation = (url: string) => {
        if (pathname === url) return;
        setIsNavigating(true);
        router.push(url);
    };

    const handleLogout = () => {
        document.cookie = "orbit-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        handleNavigation('/login');
    };

    // Se estiver nas rotas de auth, esconde a nav
    if (pathname === "/login" || pathname === "/register") return null;

    return (
        <>
            {/* Loading Overlay Global */}
            {isNavigating && (
                <div className="fixed top-0 left-0 w-full h-1 z-[100]">
                    {/* Se quiser manter seu componente Loading antigo, descomente abaixo e remova a barra acima */}
                    <div className="fixed inset-0 z-50"><Loading /></div>
                </div>
            )}

            <nav
                className={`
          relative h-full bg-zinc-950 border-r border-zinc-800 flex flex-col 
          transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? "w-20" : "w-64"}
        `}
            >
                {/* === HEADER (LOGO) === */}
                <div className="h-20 flex items-center justify-center border-b border-zinc-800/50">
                    <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap transition-all ${isCollapsed ? "px-0" : "px-4"}`}>
                        <div className="shrink-0">
                            <Logo />
                        </div>
                        <div className={`flex flex-col transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
                            <span className="font-bold text-lg text-zinc-100 leading-none">Orbit</span>
                            <span className="font-bold text-lg text-blue-500 leading-none">Cloud</span>
                        </div>
                    </div>
                </div>

                {/* === BODY (MENU ITEMS) === */}
                <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scroll">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        const Color = item.color;

                        return (
                            <button
                                key={item.href}
                                onClick={() => handleNavigation(item.href)}
                                title={isCollapsed ? item.label : ""}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive ? `bg-blue-600/10 text-${Color} border bg-${Color}/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]` : `text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-800 border border-transparent`} ${isCollapsed ? "justify-center" : "justify-start"} cursor-pointer`}
                            >
                                <Icon size={20} className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />

                                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "hidden" : "w-auto opacity-100"}`}>
                                    {item.label}
                                </span>

                                {/* Indicador Ativo (Bolinha) */}
                                {isActive && !isCollapsed && (
                                    <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-${Color} shadow-[0_0_8px_rgba(96,165,250,0.8)]`}></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* === FOOTER (USER & TOGGLE) === */}
                <div className="p-3 border-t border-zinc-800 bg-zinc-900/30">

                    {isLoading ? (
                        <div className="animate-pulse flex items-center gap-3 p-2">
                            <div className="w-8 h-8 bg-zinc-800 rounded-full"></div>
                            {!isCollapsed && <div className="h-4 w-20 bg-zinc-800 rounded"></div>}
                        </div>
                    ) : UserData ? (
                        <div className={`flex items-center gap-3 p-2 rounded-xl bg-zinc-900 border border-zinc-800 ${isCollapsed ? "justify-center" : ""}`}>
                            {/* Avatar */}
                            <div className="shrink-0 relative group cursor-pointer">
                                {UserData.avatar ? (
                                    <img src={UserData.avatar} alt="User" className="w-8 h-8 rounded-full object-cover border border-zinc-700" />
                                ) : (
                                    <UserCircle className="w-8 h-8 text-zinc-500" />
                                )}
                                {/* Status Indicator */}
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full"></div>
                            </div>

                            {/* Info & Logout */}
                            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
                                <span className="text-sm font-bold text-zinc-200 truncate max-w-[120px]">
                                    {UserData.name || UserData.username}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors text-left"
                                >
                                    Sair da conta
                                </button>
                            </div>

                            {/* Logout Button (Icon Only Mode) */}
                            {isCollapsed && (
                                <div className="absolute left-16 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                    {UserData.name}
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => handleNavigation('/login')}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {isCollapsed ? "Entrar" : "Fazer Login"}
                        </button>
                    )}

                    {/* Botão de Colapso */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-24 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white p-1 rounded-full shadow-lg hover:scale-110 transition-all z-50"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>
            </nav>
        </>
    );
}