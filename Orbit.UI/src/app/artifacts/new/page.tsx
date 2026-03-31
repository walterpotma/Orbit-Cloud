"use client";

import { useUser } from "@/context/user";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Repository } from "@/features/artifacts/services/repository";

export default function PipelinePage() {
    const { UserData, isLoading } = useUser();
    const [repositories, setRepositories] = useState<any>([]);
    const router = useRouter();

    const [formData, setFormData] = useState({
        gitRepoName: "", // Nome do repositório no GitHub
        cloneUrl: "",    // URL .git para o clone
        appName: "",
        version: "1.0.0"
    });

    const [status, setStatus] = useState({
        loading: false,
        message: "",
        type: "" // 'success' | 'error' | ''
    });

    useEffect(() => {
        // Busca a lista de repositórios do usuário
        if (!UserData) return;
        console.log("Buscando repositórios para instalaçãoId:", UserData.accountInfo.githubAppId);
        Repository.List(UserData.accountInfo.githubAppId).then(response => {
            setRepositories(response.data);
        }).catch(error => {
            console.error("Erro ao buscar repositórios:", error);
        });
    }, [UserData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Se mudar o repositório, pegamos a URL de clone que guardamos no value ou data-attr
        if (name === "gitRepoName") {
            const selectedRepo = repositories.find((r: any) => r.name === value);
            setFormData(prev => ({
                ...prev,
                gitRepoName: value,
                cloneUrl: selectedRepo ? `${selectedRepo.html_url}.git` : "",
                appName: prev.appName || value // Sugere o nome da app como o nome do repo
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true, message: "", type: "" });

        try {
            const token = localStorage.getItem('orbit_token'); // Onde seu JWT fica guardado

            // Payload agora bate com o que seu Backend C# espera
            const payload = {
                repoName: formData.gitRepoName,
                cloneUrl: formData.cloneUrl,
                appName: formData.appName,
                version: formData.version,
            };

            const response = await fetch(`https://api.orbitcloud.com.br/api/github/deploy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao processar artefato.");
            }

            setStatus({
                loading: false,
                message: `Sucesso! O deploy de ${formData.appName} foi iniciado no servidor Hayom.`,
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
        return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 font-mono">Orbit Cloud: Carregando...</div>;
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-6 md:p-8">
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Build Artefato</h1>
                    <p className="text-zinc-400 text-sm">
                        Selecione o repositório para clonagem e build automatizado via Nixpacks.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Git Repos Dropdown */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="gitRepoName" className="text-sm font-medium text-zinc-300">Repositório GitHub</label>
                        <select
                            name="gitRepoName"
                            id="gitRepoName"
                            required
                            value={formData.gitRepoName}
                            onChange={handleChange}
                            className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        >
                            <option value="">Selecione um repositório</option>
                            {repositories.map((repo: any) => (
                                <option key={repo.id} value={repo.name}>
                                    {repo.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* App Name */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="appName" className="text-sm font-medium text-zinc-300">Nome da Aplicação</label>
                            <input
                                type="text"
                                name="appName"
                                id="appName"
                                required
                                placeholder="ex: orbit-api"
                                value={formData.appName}
                                onChange={handleChange}
                                className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Version */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="version" className="text-sm font-medium text-zinc-300">Versão (Tag)</label>
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
                        disabled={status.loading || !formData.gitRepoName}
                        className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors mt-4
                            ${status.loading
                                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                            }`}
                    >
                        {status.loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Clonando e Buildando...
                            </span>
                        ) : (
                            "Iniciar Build Pipeline"
                        )}
                    </button>
                </form>

                {status.message && (
                    <div className={`mt-6 p-4 rounded-lg border text-sm animate-in fade-in slide-in-from-top-1 ${status.type === 'success'
                        ? 'bg-green-900/20 border-green-800 text-green-200'
                        : 'bg-red-900/20 border-red-800 text-red-200'
                        }`}>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{status.type === 'success' ? '🚀' : '⚠️'}</span>
                            <span className="font-normal">{status.message}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}