"use client";

import BtnRefresh from "@/components/ui/BtnRefresh";
import EmptyState from "@/components/ui/exception/EmptyState";
import { useState } from "react";

export default function Page() {
    const [ingresses, setIngresses] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [pods, setPods] = useState<any[]>([]);


    return <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start gap-5 overflow-auto custom-scroll">
        <div className="w-full">
            <div className="w-full flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Network</h1>
                <BtnRefresh />
            </div>
            {ingresses.length === 0 && services.length === 0 && pods.length === 0 ? (
                <EmptyState
                    title="Nenhuma Regra Encontrada"
                    description="Seu ambiente está limpo. Que tal fazer o deploy do seu primeiro projeto agora mesmo?"
                    icon="bi bi-globe2"
                    actionLabel="Nova Regra"
                    onAction={() => window.location.href = '/network/new'}
                />
            ) : (
                <div className="w-full">
                    foi
                </div>
            )}
        </div>
    </div>;
}