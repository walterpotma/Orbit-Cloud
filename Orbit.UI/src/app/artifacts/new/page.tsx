"use client";

import { useUser } from "@/context/user";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { Repository } from "@/features/artifacts/services/repository";

export default function PipelinePage() {
    const { UserData, isLoading } = useUser();
    const [repositories, setRepositories] = useState<any>([]);
    const [selectedRepository, setSelectedRepository] = useState<any>(null);

    const router = useRouter();

    const [formData, setFormData] = useState({
        selectedRepository: "",
        appName: "",
        version: "",
        appPath: ""
    });

    const [status, setStatus] = useState({
        loading: false,
        message: "",
        type: "" // 'success' | 'error' | ''
    });

    useEffect(() => {
        Repository.List().then(response => {
            setRepositories(response.data);
        }).catch(error => {
            console.error("Erro ao buscar repositórios:", error);
        });
    }, [UserData]);

    // Adicione o | HTMLSelectElement aqui dentro
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setStatus({ loading: true, message: "", type: "" });

        try {
            formData.appPath = formData.appName;
            const queryParams = new URLSearchParams(formData).toString();

            const response = await fetch(`https://api.orbitcloud.com.br/Build/artifact?${queryParams}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao executar pipeline.");
            }

            setStatus({
                loading: false,
                message: `Sucesso! Pipeline iniciado para ${data.details?.app} (v${data.details?.version}).`,
                type: "success"
            });

        } catch (error: any) {
            setStatus({
                loading: false,
                message: error.message || "Falha na conexão com o servidor.",
                type: "error"
            });
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">Carregando perfil...</div>;
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-6 md:p-8">
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Build Artefato</h1>
                    <p className="text-zinc-400 text-sm">
                        Preencha os dados para clonar, gerar Dockerfile e publicar a imagem.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Repositories Dropdown */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="selectedRepository" className="text-sm font-medium text-zinc-300">Repositório</label>
                        <select
                            name="selectedRepository"
                            id="selectedRepository"
                            required
                            value={formData.selectedRepository}
                            onChange={handleChange}
                            className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        >
                            <option value="">Selecione um repositório</option>
                            {repositories.map((repo: any) => (
                                <option key={repo.id} value={`${repo.html_url}.git`}>{repo.name}</option>
                            ))}
                        </select>
                    </div>

                    {/*
                    <div className="flex flex-col gap-2">
                        <label htmlFor="authToken" className="text-sm font-medium text-zinc-300">Token de Acesso (PAT)</label>
                        <input
                            type="password"
                            name="authToken"
                            id="authToken"
                            required
                            placeholder="ghp_xxxxxxxxxxxx"
                            value={formData.authToken}
                            onChange={handleChange}
                            className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                    </div> */}

                    <div className="grid grid-cols-2 gap-4">
                        {/* App Name */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="appName" className="text-sm font-medium text-zinc-300">Nome da App</label>
                            <input
                                type="text"
                                name="appName"
                                id="appName"
                                required
                                placeholder="minha-api"
                                value={formData.appName}
                                onChange={handleChange}
                                className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Version */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="version" className="text-sm font-medium text-zinc-300">Versão</label>
                            <input
                                type="text"
                                name="version"
                                id="version"
                                required
                                placeholder="1.0.0"
                                value={formData.version}
                                onChange={handleChange}
                                className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={status.loading}
                        className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors mt-4
                            ${status.loading
                                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                            }`}
                    >
                        {status.loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Executando Pipeline...
                            </span>
                        ) : (
                            "Iniciar Build Pipeline"
                        )}
                    </button>
                </form>

                {status.message && (
                    <div className={`mt-6 p-4 rounded-lg border text-sm ${status.type === 'success'
                        ? 'bg-green-900/20 border-green-800 text-green-200'
                        : 'bg-red-900/20 border-red-800 text-red-200'
                        }`}>
                        <p className="font-semibold flex items-center gap-2">
                            {status.type === 'success' ? '✅ Sucesso:' : '❌ Erro:'}
                            <span className="font-normal">{status.message}</span>
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}