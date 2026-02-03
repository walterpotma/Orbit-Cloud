"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Globe, 
  Cpu, 
  Layers, 
  HardDrive, 
  Tag, 
  RefreshCw, 
  Rocket, 
  ArrowLeft,
  Server
} from "lucide-react";
import CommandOutput from "@/features/deploy/components/deploy-output";
import { Deployments } from "@/features/deploy/services/deployments";
import { useUser } from "@/context/user";

// Tipo para os dados do Registry
type RegistryImage = {
    name: string;
    tags: string[];
};

export default function NewDeployPage() {
    const router = useRouter();
    const { UserData, isLoading: isUserLoading } = useUser();
    const [deploying, setDeploying] = useState(false);
    
    // Estados para o Registry
    const [artifacts, setArtifacts] = useState<RegistryImage[]>([]);
    const [isLoadingRegistry, setIsLoadingRegistry] = useState(true);
    
    const [form, setForm] = useState({
        name: "",
        image: "",
        tag: "",
        port: 80,
        replicas: 1,
        subdomain: "",
        isPublic: true
    });

    // Busca as imagens ao carregar a página
    useEffect(() => {
        if (!isUserLoading && UserData?.githubID) {
            fetchRegistry();
        }
    }, [UserData, isUserLoading]);

    const fetchRegistry = async () => {
        setIsLoadingRegistry(true);
        try {
            const response = await fetch(`https://api.orbitcloud.com.br/registry/user?githubId=${UserData?.githubID}`);
            const data = await response.json();
            setArtifacts(data);
        } catch (error) {
            console.error("Erro ao buscar registry:", error);
        } finally {
            setIsLoadingRegistry(false);
        }
    };

    // Encontra a imagem selecionada atualmente
    const selectedArtifact = artifacts.find(a => a.name === form.image);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Reset de tag inteligente
        if (name === "image") {
            const artifact = artifacts.find(a => a.name === value);
            if (artifact && artifact.tags.length > 0) {
                setForm(prev => ({ ...prev, tag: artifact.tags[0] }));
            } else {
                setForm(prev => ({ ...prev, tag: "latest" }));
            }
        }
    };

    const formatImageName = (fullName: string) => {
        if (fullName.includes("/")) return fullName.split("/")[1];
        return fullName;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        
        if (!form.name || !form.image) {
            alert("Por favor, preencha o Nome e selecione uma Imagem.");
            return;
        }

        setDeploying(true);

        try {
            if (!UserData?.githubID) throw new Error("Usuário não autenticado.");
            const payload = {
                name: form.name,
                image: form.image,
                tag: form.tag || "latest",
                port: Number(form.port),
                replicas: Number(form.replicas),
                subdomain: form.subdomain
            };

            await Deployments.Create(UserData.githubID, payload);

            // Redireciona de volta para a lista
            router.push('/deploy');

        } catch (error: any) {
            console.error("❌ Erro no deploy:", error);
            const msg = error.response?.data?.message || "Falha ao criar deploy.";
            alert(msg);
        } finally {
            setDeploying(false);
        }
    };

    return (
        <div className="w-full min-h-full p-6 md:p-8 flex flex-col bg-zinc-950 text-zinc-100 overflow-y-auto custom-scroll">
            
            {/* Header de Navegação */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => router.back()}
                    className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Rocket className="text-blue-500" size={32} />
                        <span className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                            Novo Deploy
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Lance uma nova aplicação no cluster a partir dos seus artefatos.
                    </p>
                </div>
            </div>

            {/* Container Centralizado */}
            <div className="w-full max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                    
                    {/* Cabeçalho do Card */}
                    <div className="px-8 py-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Server size={20} className="text-blue-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-zinc-200">Configuração do Container</h2>
                        </div>
                    </div>

                    {/* Corpo do Formulário */}
                    <div className="p-8 space-y-8">
                        
                        {/* SEÇÃO 1: DETALHES */}
                        <section>
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Layers size={14} /> Informações Básicas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nome */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Nome da Aplicação <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        placeholder="ex: minha-api" 
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-700"
                                        onChange={handleChange}
                                        value={form.name}
                                    />
                                    <p className="text-xs text-zinc-500">Apenas letras minúsculas e traços.</p>
                                </div>

                                {/* Imagem e Tag */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-zinc-300">Artefato <span className="text-red-500">*</span></label>
                                        <button 
                                            type="button" 
                                            onClick={fetchRegistry}
                                            disabled={isLoadingRegistry}
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                        >
                                            <RefreshCw size={12} className={isLoadingRegistry ? "animate-spin" : ""} />
                                            Atualizar
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select 
                                                name="image"
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                                onChange={handleChange}
                                                value={form.image}
                                                disabled={isLoadingRegistry}
                                            >
                                                <option value="" disabled>Selecione...</option>
                                                {artifacts.map((a) => (
                                                    <option key={a.name} value={a.name}>{formatImageName(a.name)}</option>
                                                ))}
                                            </select>
                                            <Box size={16} className="absolute left-3 top-3.5 text-zinc-500 pointer-events-none" />
                                        </div>

                                        <div className="relative w-1/3">
                                            <select 
                                                name="tag"
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-50"
                                                onChange={handleChange}
                                                value={form.tag}
                                                disabled={!form.image || isLoadingRegistry}
                                            >
                                                {selectedArtifact?.tags?.length ? (
                                                    selectedArtifact.tags.map(t => <option key={t} value={t}>{t}</option>)
                                                ) : <option value="latest">latest</option>}
                                            </select>
                                            <Tag size={16} className="absolute left-3 top-3.5 text-zinc-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-zinc-800" />

                        {/* SEÇÃO 2: RECURSOS */}
                        <section>
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Cpu size={14} /> Recursos & Réplicas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Porta */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Porta Interna</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            name="port"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            defaultValue={80}
                                            onChange={handleChange}
                                        />
                                        <Layers size={16} className="absolute left-3 top-3.5 text-zinc-500" />
                                    </div>
                                </div>

                                {/* Réplicas */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Réplicas (Pods)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            name="replicas"
                                            min="1" max="5"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            defaultValue={1}
                                            onChange={handleChange}
                                        />
                                        <Box size={16} className="absolute left-3 top-3.5 text-zinc-500" />
                                    </div>
                                </div>

                                {/* Memória */}
                                <div className="space-y-2 opacity-60">
                                    <label className="text-sm font-medium text-zinc-300">Memória (Limite)</label>
                                    <div className="relative">
                                        <input disabled value="512 MiB" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-500 cursor-not-allowed" />
                                        <HardDrive size={16} className="absolute left-3 top-3.5 text-zinc-600" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-zinc-800" />

                        {/* SEÇÃO 3: REDE */}
                        <section className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Globe className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h4 className="text-zinc-200 font-medium">Acesso Público (Ingress)</h4>
                                        <p className="text-xs text-zinc-500">Defina o subdomínio para acesso externo via HTTPS.</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="bg-zinc-800 border border-zinc-700 border-r-0 text-zinc-400 px-3 py-2.5 rounded-l-lg text-sm font-mono">https://</span>
                                        <input 
                                            type="text" 
                                            name="subdomain"
                                            placeholder={form.name || "nome-do-app"}
                                            className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono placeholder:text-zinc-700"
                                            onChange={handleChange}
                                        />
                                        <span className="bg-zinc-800 border border-zinc-700 border-l-0 text-zinc-500 px-3 py-2.5 rounded-r-lg text-sm font-mono">.orbitcloud.com.br</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Logs de Deploy */}
                        {deploying && (
                            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <CommandOutput />
                            </div>
                        )}
                    </div>

                    {/* Footer de Ação */}
                    <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors font-medium text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={deploying}
                            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {deploying ? (
                                <>
                                    <RefreshCw className="animate-spin" size={16} />
                                    <span>Lançando...</span>
                                </>
                            ) : (
                                <>
                                    <Rocket size={16} />
                                    <span>Lançar Aplicação</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}