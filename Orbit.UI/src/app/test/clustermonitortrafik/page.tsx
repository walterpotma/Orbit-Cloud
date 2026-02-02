"use client";

import { useState, useMemo } from "react";

// --- TIPAGEM ---
type NodeStatus = "healthy" | "warning" | "critical" | "offline" | "provisioning";

interface ServerNode {
    id: string;
    unitLabel: string; // Ex: U-05
    status: NodeStatus;
    specs: { cpuUsage: number; ramUsage: number; temp: number; };
}

interface Rack {
    id: string;
    name: string;
    location: string;
    nodes: ServerNode[]; // Geralmente 42U, vamos simular menos para caber na tela
}

// --- HELPER: GERADOR DE DADOS FAKES (Simula um Datacenter) ---
const generateClusterData = (): Rack[] => {
    const racks: Rack[] = [];
    const rackCount = 3;
    const nodesPerRack = 12; // Simulando meio rack para visualização

    for (let r = 1; r <= rackCount; r++) {
        const nodes: ServerNode[] = [];
        for (let n = nodesPerRack; n >= 1; n--) { // Ordem decrescente (U's de baixo pra cima)
            const chance = Math.random();
            let status: NodeStatus = "healthy";
            // Simulação de problemas
            if (chance > 0.95) status = "critical";
            else if (chance > 0.85) status = "warning";
            else if (chance > 0.80) status = "provisioning";
            else if (chance > 0.75) status = "offline";

            nodes.push({
                id: `R${r}-N${String(n).padStart(2, '0')}`,
                unitLabel: `${n}U`,
                status,
                specs: {
                    cpuUsage: status === 'offline' ? 0 : Math.floor(Math.random() * 90) + 5,
                    ramUsage: status === 'offline' ? 0 : Math.floor(Math.random() * 80) + 15,
                    temp: status === 'offline' ? 20 : Math.floor(Math.random() * 40) + 35, // Celsius
                }
            });
        }
        racks.push({
            id: `rack-${r}`,
            name: `ORBIT-RACK-${String(r).padStart(2, '0')}`,
            location: `Zona ${r === 1 ? 'A (Principal)' : r === 2 ? 'B (Redundância)' : 'C (Edge)'}`,
            nodes
        });
    }
    return racks;
};

export default function ClusterRackMonitor() {
    const clusterData = useMemo(() => generateClusterData(), []);
    // Estado para o "Painel de Detalhes" lateral
    const [selectedNode, setSelectedNode] = useState<ServerNode | null>(null);

    // --- HELPERS VISUAIS ---
    const getStatusStyles = (status: NodeStatus) => {
        switch (status) {
            case "healthy": return { 
                bar: "bg-emerald-500", 
                glow: "shadow-[0_0_10px_rgba(16,185,129,0.5)]", 
                led: "bg-emerald-400" 
            };
            case "warning": return { 
                bar: "bg-amber-500", 
                glow: "shadow-[0_0_10px_rgba(245,158,11,0.5)]", 
                led: "bg-amber-400 animate-pulse" // Piscando lento
            };
            case "critical": return { 
                bar: "bg-red-600", 
                glow: "shadow-[0_0_15px_rgba(220,38,38,0.7)]", 
                led: "bg-red-500 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]" // Piscando rápido (ping)
            };
            case "provisioning": return { 
                bar: "bg-blue-500", 
                glow: "shadow-[0_0_10px_rgba(59,130,246,0.5)]", 
                led: "bg-blue-400 animate-pulse" 
            };
            case "offline": default: return { 
                bar: "bg-zinc-700", 
                glow: "", 
                led: "bg-zinc-800 border border-zinc-600" 
            };
        }
    };

    return (
        <div className="w-full min-h-screen bg-zinc-950 p-8 font-sans flex gap-8 items-start justify-center">
            
            {/* --- ÁREA PRINCIPAL DOS RACKS --- */}
            <div className="flex-1 max-w-5xl">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                        <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                        Monitoramento Físico do Cluster
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">Visualização em tempo real da infraestrutura de hardware.</p>
                </div>

                {/* Grid de Racks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {clusterData.map((rack) => (
                        // --- COMPONENTE RACK (A estrutura metálica) ---
                        <div key={rack.id} className="flex flex-col">
                            {/* Cabeçalho do Rack */}
                            <div className="bg-zinc-900/80 border-x border-t border-zinc-800 rounded-t-lg p-3 text-center relative overflow-hidden">
                                {/* Detalhe decorativo "parafusos" */}
                                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700 shadow-inner"></div>
                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700 shadow-inner"></div>
                                <h3 className="text-sm font-bold text-zinc-200 tracking-widest">{rack.name}</h3>
                                <p className="text-[10px] text-zinc-500 uppercase">{rack.location}</p>
                            </div>

                            {/* Corpo do Rack (Onde ficam os servidores) */}
                            <div className="bg-zinc-950 border-x border-b border-zinc-800 p-2 rounded-b-lg shadow-2xl relative bg-[url('/subtle-grid.png')] bg-repeat">
                                {/* Trilhos laterais decorativos */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-800"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-800"></div>

                                <div className="flex flex-col gap-[2px] relative z-10">
                                    {rack.nodes.map((node) => {
                                        const styles = getStatusStyles(node.status);
                                        const isSelected = selectedNode?.id === node.id;
                                        
                                        return (
                                            // --- UNIDADE DE SERVIDOR (O "Blade") ---
                                            <div 
                                                key={node.id}
                                                onMouseEnter={() => setSelectedNode(node)}
                                                // Mantém selecionado se clicar, ou desseleciona se clicar de novo
                                                onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                                                className={`
                                                    group relative h-8 bg-zinc-900/90 border border-zinc-800/80 rounded-[2px] 
                                                    flex items-center pl-1 pr-3 gap-3 cursor-crosshair transition-all duration-150
                                                    ${isSelected ? `border-zinc-500 ${styles.glow} scale-[1.02] z-20` : `hover:border-zinc-600 hover:bg-zinc-800 ${styles.glow.replace('0.5', '0.2')}`}
                                                `}
                                            >
                                                {/* Indicador de Unidade (1U, 2U...) */}
                                                <span className="text-[9px] font-mono text-zinc-600 w-5 text-right select-none group-hover:text-zinc-400 transition-colors">
                                                    {node.unitLabel}
                                                </span>

                                                {/* Barra de Status Lateral (Brilhante) */}
                                                <div className={`h-4/5 w-1 rounded-full ${styles.bar} transition-all group-hover:w-1.5`}></div>

                                                {/* LED indicador piscante */}
                                                <div className={`w-1.5 h-1.5 rounded-full ${styles.led} shadow-sm`}></div>

                                                {/* Nome do Nó */}
                                                <span className={`text-xs font-bold tracking-wider select-none flex-1 text-left transition-colors ${node.status === 'offline' ? 'text-zinc-600' : 'text-zinc-300 group-hover:text-white'}`}>
                                                    {node.id}
                                                </span>

                                                {/* Miniatura de status (Visível só no hover se não for offline) */}
                                                {node.status !== 'offline' && (
                                                    <div className="hidden group-hover:flex items-center gap-2 text-[9px] text-zinc-400 font-mono select-none">
                                                       <span>CPU:{node.specs.cpuUsage}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Base do Rack */}
                            <div className="h-4 bg-zinc-900 border-x border-b border-zinc-800 rounded-b-md mt-[1px] shadow-md"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- PAINEL LATERAL DE DETALHES (Fixo) --- */}
            <div className={`w-80 bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl sticky top-8 transition-all duration-300 ${selectedNode ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-8 pointer-events-none grayscale'}`}>
                
                {selectedNode ? (
                    <>
                        <div className="mb-6 pb-4 border-b border-zinc-800 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{selectedNode.id}</h3>
                                <p className="text-xs text-zinc-500 uppercase mt-1 flex items-center gap-2">
                                    Posição Física: <span className="font-mono text-zinc-300">{selectedNode.unitLabel}</span>
                                </p>
                            </div>
                            {/* Status Badge Grande */}
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyles(selectedNode.status).bar.replace('bg-', 'bg-opacity-20 text-')}`}>
                                {selectedNode.status}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Métricas Principais */}
                            <div>
                                <h4 className="text-xs text-zinc-500 uppercase font-bold mb-3">Métricas de Hardware</h4>
                                <div className="space-y-4">
                                    {/* Barra de CPU */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-zinc-400">CPU Load</span>
                                            <span className={selectedNode.specs.cpuUsage > 85 ? 'text-red-400 font-bold' : 'text-zinc-200'}>{selectedNode.specs.cpuUsage}%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${selectedNode.specs.cpuUsage > 85 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${selectedNode.specs.cpuUsage}%` }}></div>
                                        </div>
                                    </div>
                                    {/* Barra de RAM */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-zinc-400">RAM Usage</span>
                                            <span className="text-zinc-200">{selectedNode.specs.ramUsage}%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${selectedNode.specs.ramUsage}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Temperatura */}
                            <div className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                                <span className="text-xs text-zinc-500 uppercase font-bold">Temperatura</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-2xl font-bold font-mono ${selectedNode.specs.temp > 65 ? 'text-orange-500 animate-pulse' : 'text-emerald-400'}`}>
                                        {selectedNode.specs.temp}°C
                                    </span>
                                </div>
                            </div>
                        </div>
                         <div className="mt-8 text-center">
                            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase rounded-md border border-zinc-700 transition-colors w-full">
                                Acessar Terminal IPMI
                            </button>
                        </div>
                    </>
                ) : (
                    // Estado Vazio do Painel
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-4 opacity-70">
                        <div className="w-16 h-16 rounded-full border-2 border-zinc-700 border-dashed animate-spin-slow"></div>
                        <p className="text-sm uppercase font-bold tracking-widest text-center">Selecione um nó<br/>para ver detalhes</p>
                    </div>
                )}
            </div>
        </div>
    );
}