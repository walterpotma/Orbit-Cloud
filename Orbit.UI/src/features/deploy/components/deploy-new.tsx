"use client"
import { useState, useEffect } from "react";
import { X, Box, Globe, Cpu, Layers, HardDrive, Tag, RefreshCw } from "lucide-react";
import CommandOutput from "@/features/deploy/components/deploy-output";
import { Deployments } from "@/features/deploy/services/deployments";
import { useUser } from "@/context/user";

// Tipo para os dados do Registry
type RegistryImage = {
    name: string;
    tags: string[];
};

export default function NewDeployModal({ onClose }: { onClose: (value: boolean) => void }) {
    const { UserData } = useUser();
    const [deploying, setDeploying] = useState(false);
    
    // Estados para o Registry
    const [artifacts, setArtifacts] = useState<RegistryImage[]>([]);
    const [isLoadingRegistry, setIsLoadingRegistry] = useState(true);
    
    const [form, setForm] = useState({
        name: "",
        image: "",
        tag: "", // Agora começa vazio para forçar seleção
        port: 80,
        replicas: 1,
        subdomain: "",
        isPublic: true
    });

    // Busca as imagens ao abrir o modal
    useEffect(() => {
        fetchRegistry();
    }, []);

    const fetchRegistry = async () => {
        setIsLoadingRegistry(true);
        try {
            // Ajuste a URL se necessário
            const response = await fetch("https://api.orbitcloud.com.br/registry");
            const data = await response.json();
            setArtifacts(data);
        } catch (error) {
            console.error("Erro ao buscar registry:", error);
        } finally {
            setIsLoadingRegistry(false);
        }
    };

    // Encontra a imagem selecionada atualmente para pegar as tags dela
    const selectedArtifact = artifacts.find(a => a.name === form.image);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Se mudou a imagem, reseta a tag automaticamente para a mais recente (primeira da lista)
        if (name === "image") {
            const artifact = artifacts.find(a => a.name === value);
            if (artifact && artifact.tags.length > 0) {
                setForm(prev => ({ ...prev, tag: artifact.tags[0] }));
            } else {
                setForm(prev => ({ ...prev, tag: "latest" }));
            }
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        
        if (!form.name || !form.image) {
            alert("Por favor, preencha o Nome e selecione uma Imagem.");
            return;
        }

        if (!UserData?.githubID) {
            alert("Erro de sessão. Tente recarregar a página.");
            return;
        }

        setDeploying(true);

        try {
            const payload = {
                name: form.name,
                image: form.image,
                tag: form.tag || "latest",
                port: Number(form.port),
                replicas: Number(form.replicas),
                subdomain: form.subdomain
            };

            console.log("🚀 Enviando para API...", payload);
            await Deployments.Create(UserData.githubID, payload);

            alert("Deploy iniciado com sucesso!");
            onClose(false);
            window.location.reload();

        } catch (error: any) {
            console.error("❌ Erro no deploy:", error);
            const msg = error.response?.data?.message || "Falha ao criar deploy. Verifique o console.";
            alert(msg);
        } finally {
            setDeploying(false);
        }
    };

    // Função auxiliar para limpar o nome da imagem no visual (remove o ID do github)
    const formatImageName = (fullName: string) => {
        if (fullName.includes("/")) {
            return fullName.split("/")[1];
        }
        return fullName;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Box className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Nova Aplicação</h1>
                            <p className="text-sm text-slate-400">Lance um container a partir dos seus artefatos</p>
                        </div>
                    </div>
                    <button onClick={() => onClose(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll p-8">
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        
                        {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
                        <section>
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Layers size={16} /> Detalhes do Container
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nome da App */}
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300 font-medium">Nome da Aplicação <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        placeholder="ex: minha-api-node" 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                                        onChange={handleChange}
                                        value={form.name}
                                    />
                                    <p className="text-xs text-slate-500">Apenas letras minúsculas e traços.</p>
                                </div>

                                {/* Imagem Docker (Select) */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm text-slate-300 font-medium">Artefato (Imagem) <span className="text-red-500">*</span></label>
                                        <button 
                                            type="button" 
                                            onClick={fetchRegistry} 
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            disabled={isLoadingRegistry}
                                        >
                                            <RefreshCw size={12} className={isLoadingRegistry ? "animate-spin" : ""} />
                                            Atualizar Lista
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        {/* Select de IMAGEM */}
                                        <div className="relative flex-1">
                                            <select 
                                                name="image"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                                onChange={handleChange}
                                                value={form.image}
                                                disabled={isLoadingRegistry}
                                            >
                                                <option value="" disabled>Selecione um artefato...</option>
                                                {artifacts.map((artifact) => (
                                                    <option key={artifact.name} value={artifact.name}>
                                                        {formatImageName(artifact.name)}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute left-3 top-3.5 text-slate-500 pointer-events-none">
                                                <Box size={16} />
                                            </div>
                                        </div>

                                        {/* Select de TAG */}
                                        <div className="relative w-1/3">
                                            <select 
                                                name="tag"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                onChange={handleChange}
                                                value={form.tag}
                                                disabled={!form.image || isLoadingRegistry}
                                            >
                                                {selectedArtifact?.tags && selectedArtifact.tags.length > 0 ? (
                                                    selectedArtifact.tags.map((tag) => (
                                                        <option key={tag} value={tag}>{tag}</option>
                                                    ))
                                                ) : (
                                                    <option value="latest">latest</option>
                                                )}
                                            </select>
                                            <div className="absolute left-3 top-3.5 text-slate-500 pointer-events-none">
                                                <Tag size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {isLoadingRegistry ? "Carregando artefatos..." : "Selecione a imagem e a versão."}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-800" />

                        {/* SEÇÃO 2: RECURSOS E REDE */}
                        <section>
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Cpu size={16} /> Configuração
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* Porta Interna */}
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300 font-medium">Porta do Container</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            name="port"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            defaultValue={80}
                                            onChange={handleChange}
                                        />
                                        <div className="absolute left-3 top-3.5 text-slate-500">
                                            <Layers size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Réplicas */}
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300 font-medium">Réplicas (Pods)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            name="replicas"
                                            min="1"
                                            max="5"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            defaultValue={1}
                                            onChange={handleChange}
                                        />
                                        <div className="absolute left-3 top-3.5 text-slate-500">
                                            <Box size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Memória (Fixo) */}
                                <div className="space-y-2 opacity-50 cursor-not-allowed">
                                    <label className="text-sm text-slate-300 font-medium">Memória (Plano Free)</label>
                                    <div className="relative">
                                        <input 
                                            disabled
                                            value="512 MiB"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-400"
                                        />
                                        <div className="absolute left-3 top-3.5 text-slate-500">
                                            <HardDrive size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-800" />

                        {/* SEÇÃO 3: ACESSO EXTERNO */}
                        <section className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/50">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg mt-1">
                                    <Globe className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h3 className="text-white font-medium">Acesso Público (Ingress)</h3>
                                        <p className="text-xs text-slate-400">Seu app ficará visível na internet.</p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <span className="bg-slate-700 border border-slate-600 border-r-0 text-slate-300 px-3 py-2.5 rounded-l-lg text-sm">
                                            https://
                                        </span>
                                        <input 
                                            type="text" 
                                            name="subdomain"
                                            placeholder={form.name || "nome-do-app"}
                                            className="flex-1 bg-slate-900 border border-slate-600 px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                                            onChange={handleChange}
                                        />
                                        <span className="bg-slate-700 border border-slate-600 border-l-0 text-slate-400 px-3 py-2.5 rounded-r-lg text-sm">
                                            .orbitcloud.com.br
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {deploying && (
                            <div className="mt-4 animate-in fade-in zoom-in duration-300">
                                <label className="text-sm text-slate-400 mb-2 block">Processando solicitação...</label>
                                <CommandOutput /> 
                            </div>
                        )}

                    </form>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                    <button 
                        onClick={() => onClose(false)}
                        className="px-6 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={deploying}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/20 transition-all transform hover:scale-105 space-x-1 justify-center flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {deploying ? (
                            <>
                                <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                                <p>Enviando...</p>
                            </>
                        ) : (
                            <>
                                <Box className="w-4 h-4 mr-2" />
                                <p>Lançar Deploy</p>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}