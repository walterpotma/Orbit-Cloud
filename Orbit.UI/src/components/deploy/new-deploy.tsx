"use client"
import { useState } from "react";
import { X, Box, Globe, Cpu, Layers, HardDrive } from "lucide-react";
import CommandOutput from "@/components/deploy/command-output";
import { Deployments } from "@/api/kubernetes"; // <--- Importante
import { useUser } from "@/context/user";       // <--- Importante

export default function NewDeployModal({ onClose }: { onClose: (value: boolean) => void }) {
    const { UserData } = useUser(); // Pegamos o ID do usuário logado
    const [deploying, setDeploying] = useState(false);
    
    // Estado do Formulário
    const [form, setForm] = useState({
        name: "",
        image: "",
        tag: "latest",
        port: 80,
        replicas: 1,
        subdomain: "",
        isPublic: true
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        
        // 1. Validação Básica (Front-end)
        if (!form.name || !form.image) {
            alert("Por favor, preencha o Nome e a Imagem do container.");
            return;
        }

        if (!UserData?.githubID) {
            alert("Erro de sessão. Tente recarregar a página.");
            return;
        }

        setDeploying(true);

        try {
            // 2. Montando o Payload (Dados para a API)
            // Convertendo números para garantir que o C# aceite
            const payload = {
                name: form.name,
                image: form.image,
                tag: form.tag || "latest",
                port: Number(form.port),
                replicas: Number(form.replicas),
                subdomain: form.subdomain
            };

            console.log("🚀 Enviando para API...", payload);

            // 3. Chamada Real para a API
            await Deployments.Create(UserData.githubID, payload);

            // 4. Sucesso!
            alert("Deploy iniciado com sucesso!");
            onClose(false);
            window.location.reload(); // Recarrega para ver o novo deploy na tabela

        } catch (error: any) {
            console.error("❌ Erro no deploy:", error);
            const msg = error.response?.data?.message || "Falha ao criar deploy. Verifique o console.";
            alert(msg);
        } finally {
            setDeploying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            
            {/* Container Principal */}
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Box className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Nova Aplicação</h1>
                            <p className="text-sm text-slate-400">Configure os detalhes do seu container</p>
                        </div>
                    </div>
                    <button onClick={() => onClose(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Corpo do Modal (Scrollável) */}
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
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        onChange={handleChange}
                                        value={form.name}
                                    />
                                    <p className="text-xs text-slate-500">Apenas letras minúsculas e traços.</p>
                                </div>

                                {/* Imagem Docker */}
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300 font-medium">Imagem Docker <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            name="image"
                                            placeholder="ex: nginx, node" 
                                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            onChange={handleChange}
                                            value={form.image}
                                        />
                                        <input 
                                            type="text" 
                                            name="tag"
                                            placeholder="tag" 
                                            className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-blue-500 text-center"
                                            defaultValue="latest"
                                            onChange={handleChange}
                                        />
                                    </div>
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

                        {/* Área de Logs */}
                        {deploying && (
                            <div className="mt-4 animate-in fade-in zoom-in duration-300">
                                <label className="text-sm text-slate-400 mb-2 block">Processando solicitação...</label>
                                <CommandOutput /> 
                            </div>
                        )}

                    </form>
                </div>

                {/* Footer Fixo */}
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
                                <i className="bi bi-arrow-repeat animate-spin"></i>
                                <p>Enviando...</p>
                            </>
                        ) : (
                            <>
                                <i className="bi bi-rocket-fill"></i>
                                <p>Lançar Deploy</p>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}