"use client";
import { Feather, Gauge, Rabbit, Sprout } from "lucide-react";
import { useState, useEffect } from "react";
import Micro from "@/components/subscription/micro";
import Starter from "@/components/subscription/starter";
import Basic from "@/components/subscription/basic";
import Pro from "@/components/subscription/pro";
import Business from "@/components/subscription/business";
import Enterprise from "@/components/subscription/entrepise";
import Custom from "@/components/subscription/custom";
import BtnNav1Subscription from "@/components/ui/subscriptions/btn-nav-subsc1";

const subscriptions = {
    basic: Basic,
    starter: Starter,
    micro: Micro,
    pro: Pro,
    business: Business,
    enterprise: Enterprise,
    custom: Custom,
};
type TabName = keyof typeof subscriptions;

export default function Page() {
    const [activeTab, setActiveTab] = useState<TabName>('basic');
    const ComponenteAtivo = subscriptions[activeTab];

    const handleTabClick = (tab: TabName) => {
        setActiveTab(tab);
    };

    const cantoRedondo = (lado: string) => {
        switch (lado) {
            case ('left'):
                return (
                    <i className="bg-slate-900">
                        <p className="p-2 rounded-lg rounded-t-none rounded-r-none bg-slate-950"></p>
                    </i>
                );
            case ('right'):
                return (
                    <i className="bg-slate-900">
                        <p className="p-2 rounded-lg rounded-t-none rounded-l-none bg-slate-950"></p>
                    </i>
                );
            default:
                return
        }
    }

    const styleActive = "bg-slate-900 text-blue-500";

    return (
        <div className="w-full h-full rounded-xl">
            <nav className="w-full p-1 pb-0 rounded-t-xl bg-slate-950 flex items-end justify-between space-x-0">
                <BtnNav1Subscription title="teste" />
                {cantoRedondo('right')}
                <button onClick={() => handleTabClick('micro')} className={`w-full ${activeTab === 'micro' ? `${styleActive}` : ''} px-2 py-1 rounded-t-lg flex justify-center items-center space-x-1 hover:bg-slate-900 hover:text-blue-500 cursor-pointer`}>
                    <i className="bi bi-feather"></i>
                    <p>Micro</p>
                </button>
                {cantoRedondo('left')}
                {cantoRedondo('right')}
                <button onClick={() => handleTabClick('starter')} className={`w-full ${activeTab === 'starter' ? `${styleActive}` : ''} px-2 py-1 rounded-t-lg flex justify-center items-center space-x-1 hover:bg-slate-900 hover:text-blue-500 cursor-pointer`}>
                    <Sprout size={16} />
                    <p>Starter</p>
                </button>
                {cantoRedondo('left')}
                {cantoRedondo('right')}
                <button onClick={() => handleTabClick('basic')} className={`w-full ${activeTab === 'basic' ? `${styleActive}` : ''} px-2 py-1 rounded-t-lg flex justify-center items-center space-x-1 hover:bg-slate-900 hover:text-blue-500 cursor-pointer`}>
                    <Rabbit size={16} />
                    <p>Basic</p>
                </button>
                {cantoRedondo('left')}
                {cantoRedondo('right')}
                <button onClick={() => handleTabClick('pro')} className={`w-full ${activeTab === 'pro' ? `${styleActive}` : ''} px-2 py-1 rounded-t-lg flex justify-center items-center space-x-1 hover:bg-slate-900 hover:text-blue-500 cursor-pointer`}>
                    <i className="bi bi-briefcase"></i>
                    <p>Pro</p>
                </button>
                {cantoRedondo('left')}
                {cantoRedondo('right')}
                <button onClick={() => handleTabClick('business')} className={`w-full ${activeTab === 'business' ? `${styleActive}` : ''} px-2 py-1 rounded-t-lg flex justify-center items-center space-x-1 hover:bg-slate-900 hover:text-blue-500 cursor-pointer`}>
                    <i className="bi bi-graph-up-arrow"></i>
                    <p>Business</p>
                </button>
                {cantoRedondo('left')}
                {cantoRedondo('right')}
                <button onClick={() => handleTabClick('enterprise')} className={`w-full ${activeTab === 'enterprise' ? `${styleActive}` : ''} px-2 py-1 rounded-t-lg flex justify-center items-center space-x-1 hover:bg-slate-900 hover:text-blue-500 cursor-pointer`}>
                    <i className="bi bi-gem"></i>
                    <p>Enterprise</p>
                </button>
                {cantoRedondo('left')}
                {cantoRedondo('right')}
                <button onClick={() => handleTabClick('custom')} className={`w-full ${activeTab === 'custom' ? `${styleActive}` : ''} px-2 py-1 rounded-t-lg flex justify-center items-center space-x-1 hover:bg-slate-900 hover:text-blue-500 cursor-pointer`}>
                    <i className="bi bi-sliders"></i>
                    <p>Custom</p>
                </button>
                {cantoRedondo('left')}
            </nav>
            <div>
                {ComponenteAtivo && <ComponenteAtivo />}
            </div>
        </div>
    );
}