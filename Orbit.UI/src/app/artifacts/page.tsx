"use client";

import { useState, useEffect } from "react";
import ButtonRefresh from "@/components/ui/button-refresh";
import { useUser } from "@/context/user";
import { Box, Tag, Rocket, Clock, Layers } from "lucide-react";
import { RegistryImage } from "@/features/artifacts/types/registry-image";
import { Registry } from "@/features/artifacts/services/registry";
import EmptyState from "@/components/ui/exception-state";
import { useRouter } from "next/navigation";

export default function Page() {
    const { UserData } = useUser();
    
    const router = useRouter();
    
    const [artifacts, setArtifacts] = useState<RegistryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        if (!UserData) return;
        setIsLoading(true);
        try {
            Registry.List(UserData?.githubID)
                .then((res: any) => setArtifacts(res.data))
                .catch((err: any) => console.error("Error fetching artifacts:", err));
        } catch (error) {
            console.error("Erro ao buscar artefatos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [UserData, isLoading]);

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll bg-zinc-950 text-zinc-100">
            <div className="w-full mx-auto">
                <div className="w-full mb-8 flex justify-between items-center border-b border-zinc-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Layers className="text-purple-500" /> Artefatos
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            Gerencie as versões de imagens Docker armazenadas no Registry.
                        </p>
                    </div>
                    <div className="flex justify-center items-center space-x-3">
                        <button className="px-4 py-2 text-sm rounded-lg border border-blue-500 text-white bg-blue-500 hover:bg-blue-600 cursor-pointer" onClick={() => router.push("/artifacts/new")}>
                            Novo Artefato
                        </button>
                        <div onClick={loadData}>
                            <ButtonRefresh />
                        </div>
                    </div>
                </div>

                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {artifacts.map((repo) => (
                            <div
                                key={repo.name}
                                className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                            >
                                <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-zinc-800 rounded-lg">
                                            <Box size={20} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg tracking-tight">
                                                {repo.name.split("/")[1] || repo.name}
                                            </h3>
                                            <span className="text-xs text-zinc-500 font-mono">
                                                {repo.name}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium bg-zinc-800 px-2 py-1 rounded text-zinc-400">
                                        {repo.tags.length} versões
                                    </span>
                                </div>

                                <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scroll">
                                    {repo.tags.length === 0 ? (
                                        <div className="text-center py-4 text-zinc-600 text-sm">
                                            Nenhuma versão encontrada.
                                        </div>
                                    ) : (
                                        repo.tags.map((tag) => (
                                            <div
                                                key={tag}
                                                className="group flex items-center justify-between p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:bg-zinc-800/50 transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Tag size={16} className="text-zinc-500" />
                                                    <span className="font-mono text-sm text-green-400 font-medium">
                                                        {tag}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-md transition-colors"
                                                        onClick={() => router.push(`/deploy/new?image=${repo.name}:${tag}`)}
                                                    >
                                                        <Rocket size={12} />
                                                        Lançar
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {artifacts.length === 0 && (
                    <EmptyState
                        title="Nenhum Artefato Armazenado"
                        description="Seu ambiente está limpo. Criar sua primeira versão e Artefato Agora!"
                        icon="bi bi-rocket-takeoff"
                        actionLabel="Novo Artefato"
                        onAction={() => window.location.href = '/artifacts/new'}
                    />
                )}
            </div>
        </div>
    );
}