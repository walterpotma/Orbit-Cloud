"use client"
import { useState, useEffect } from "react";
import Logo from "@/components/layout/logo";
import "bootstrap-icons/font/bootstrap-icons.css";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/layout/loading";
import { useUser } from "@/context/user";

// Componentes React devem ser PascalCase (Header, não header)
export default function Header() {
    const pathUrl = usePathname();
    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(true); // Renomeei para evitar conflito com isLoading do user
    
    // Pegamos o isLoading do contexto também
    const { UserData, isLoading } = useUser();

    // 🔍 DEBUG: Veja no console do navegador o que aparece aqui
    useEffect(() => {
        console.log("Status do Usuário:", { isLoading, UserData });
    }, [isLoading, UserData]);

    const navigationTo = (url: string) => {
        setPageLoading(true);
        setTimeout(() => {
            router.push(url);
        }, 50);
    }

    useEffect(() => {
        setPageLoading(false);
    }, [pathUrl]);

    // Se for página de login/registro, esconde o header
    if (pathUrl === "/login" || pathUrl === "/register") return null;

    return (
        <header className="w-full px-0 pr-5 py-0 border-b border-slate-700 flex justify-between items-center bg-[var(--dark)]">
            <h1 className="flex justify-center items-center space-x-2">
                <Logo />
                <p className="text-blue-500 text-3xl font-bold transform -translate-x-5">Cloud</p>
            </h1>
            
            <nav>
                <a href=""></a>
            </nav>

            <div className="flex items-center space-x-10">
                {/* LÓGICA CORRIGIDA:
                    1. Se estiver carregando (isLoading), mostra um esqueleto ou nada.
                    2. Se tiver UserData, mostra o nome.
                    3. Se não tiver nenhum dos dois, mostra Login.
                */}
                
                {isLoading ? (
                    // Estado de Carregamento (Skeleton simples)
                    <div className="animate-pulse flex items-center space-x-3">
                        <div className="h-4 w-24 bg-slate-700 rounded"></div>
                        <div className="h-8 w-8 bg-slate-700 rounded-full"></div>
                    </div>
                ) : UserData ? (
                    // Usuário Logado
                    <div className="text-slate-500 flex items-center space-x-3 cursor-pointer hover:text-slate-300 transition-colors">
                        <p className="font-medium">{UserData.name || UserData.username || "Usuário"}</p>
                        {UserData.avatar ? (
                            <img src={UserData.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-600" />
                        ) : (
                            <i className="bi bi-person-circle text-3xl"></i>
                        )}
                    </div>
                ) : (
                    // Usuário Deslogado
                    <button 
                        onClick={() => navigationTo("/login")} 
                        className="px-4 py-2 rounded-lg border-2 border-blue-500 text-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition ease-in-out duration-200"
                    >
                        Login
                    </button>
                )}
            </div>

            {pageLoading && <div className="fixed top-0 left-0 z-50"><Loading /></div>}
        </header>
    );
}