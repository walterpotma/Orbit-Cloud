"use client"
import { useState, useEffect, ReactNode } from "react";
import Logo from "@/components/layout/logo";
import "bootstrap-icons/font/bootstrap-icons.css";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/layout/loading";
import { useUser } from "@/context/user";
import Button from "../ui/BtnRefresh";

export default function header() {
    const pathUrl = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { UserData, isLoading } = useUser();

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
            <div className="flex items-center space-x-10">

                {UserData ?
                    (
                        <div className="text-slate-500 flex items-center space-x-3 cursor-pointer">
                            <p>{UserData?.name || "Error"}</p>
                            <i className="bi bi-person-circle text-4xl"></i>
                        </div>
                    )
                    :
                    (<button onClick={() => navigationTo("/login")} className="px-4 py-2 rounded-lg border-2 border-blue-500 text-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition ease-in-out duration-200">Login</button>)
                }


            </div>

            {loading && <div className="position fixed top-0 left-0"><Loading /></div>}
        </header>
    );
}