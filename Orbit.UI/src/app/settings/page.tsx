"use client"
import { RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import Profille from "@/components/settings/proffile";
import Preference from "@/components/settings/preference";

const componentMap = {
    profile: Profille,
    preferences: Preference,
};

type TabName = keyof typeof componentMap;

export default function Page() {
    const [activeTab, setActiveTab] = useState<TabName>('profile');
    const active = "bg-slate-800 text-blue-500 border-l-2 border-blue-500";
    const ComponenteAtivo = componentMap[activeTab];

    const handleTabClick = (tab: TabName) => {
        setActiveTab(tab);
    };

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Configurações</h1>
                    <div className="flex justify-center items-center space-x-3">
                        <button className="py-2 px-4 rounded-lg text-blue-500 text-sm border border-blue-600 flex justify-center items-center space-x-2 cursor-pointer hover:bg-blue-600/20 transition ease-in-out duration-200"><p>Refresh</p> <RefreshCcw size={16} /></button>
                    </div>
                </div>
                <div className="w-full flex space-x-4">
                    <nav className={`w-60 py-5 rounded-2xl bg-[var(--dark)]`}>
                        <button onClick={() => handleTabClick('profile')} className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${activeTab === 'profile' ? `${active}` : ''}`}>
                            <i className="bi bi-person-circle mr-2 text-lg"></i>
                            Perfil
                        </button>
                        {/* <button className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 $`}>
                            <i className="bi bi-shield-shaded mr-2 text-lg"></i>
                            Segurança
                        </button>
                        <button className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 $`}>
                            <i className="bi bi-bell-fill mr-2 text-lg"></i>
                            Notificações
                        </button> 
                        <button className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 $`}>
                            <i className="bi bi-people-fill mr-2 text-lg"></i>
                            Equipe
                        </button>
                        <button className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 $`}>
                            <i className="bi bi-key-fill mr-2 text-lg"></i>
                            Keys
                        </button>*/}
                        <button onClick={() => handleTabClick('preferences')} className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${activeTab === 'preferences' ? `${active}` : ''}`}>
                            <i className="bi bi-sliders mr-2 text-lg"></i>
                            Preferencias
                        </button>
                    </nav>
                    <div className="w-full p-4 rounded-2xl bg-slate-900 text-slate-400">
                        {ComponenteAtivo && <ComponenteAtivo />}
                    </div>
                </div>
            </div>
        </div>
    );
}