"use client";

import { useState, useMemo } from "react";

// --- TIPAGEM ---
type PodStatus = "Running" | "Pending" | "Failed" | "CrashLoopBackOff" | "Completed";

interface PodChip {
    id: string;
    name: string;
    namespace: string;
    status: PodStatus;
    // Carga simulada (0-100%) para colorir a intensidade
    loadIntensity: number; 
}

interface K8sNode {
    name: string;
    role: "control-plane" | "worker";
    capacity: { cpu: string; memory: string };
    pods: PodChip[];
}

// --- HELPER: GERADOR DE DADOS FAKES (Simula um Cluster K8s) ---
const generateClusterPods = (): K8sNode[] => {
    const nodes: K8sNode[] = [];
    const nodeNames = ["orbit-worker-01", "orbit-worker-02", "orbit-worker-03 (GPU)"];

    nodeNames.forEach((nodeName, index) => {
        const podCount = Math.floor(Math.random() * 40) + 20; // Entre 20 e 60 pods por nó
        const pods: PodChip[] = [];

        const namespaces = ["default", "kube-system", "orbit-app", "monitoring"];
        const workloads = ["nginx-ingress", "coredns", "orbit-api-deployment", "postgres-pool", "redis-cache-worker"];

        for (let i = 0; i < podCount; i++) {
            const chance = Math.random();
            let status: PodStatus = "Running";
            let loadIntensity = Math.floor(Math.random() * 60) + 10; // Carga normal

            if (chance > 0.96) { status = "CrashLoopBackOff"; loadIntensity = 95; }
            else if (chance > 0.92) { status = "Failed"; loadIntensity = 0; }
            else if (chance > 0.88) { status = "Pending"; loadIntensity = 10; }
            else if (chance > 0.7) { loadIntensity = Math.floor(Math.random() * 30) + 70; } // Pods com alta carga

            pods.push({
                id: `pod-${Math.random().toString(36).substr(2, 9)}`,
                name: `${workloads[i % workloads.length]}-${Math.random().toString(36).substr(2, 5)}`,
                namespace: namespaces[i % namespaces.length],
                status,
                loadIntensity
            });
        }
        
        // Ordena por status para agrupar os erros visualmente (opcional, mas fica bonito)
        pods.sort((a, b) => (a.status === 'Running' ? 1 : -1));

        nodes.push({
            name: nodeName,
            role: index === 0 ? "control-plane" : "worker",
            capacity: { cpu: "8 vCPU", memory: "32 GiB" },
            pods
        });
    });
    return nodes;
};

export default function NodeDensityVisualizer() {
    const data = useMemo(() => generateClusterPods(), []);
    const [hoveredPod, setHoveredPod] = useState<{ pod: PodChip, rect: DOMRect } | null>(null);

    // --- HELPERS VISUAIS ---
    const getPodStyle = (pod: PodChip) => {
        // Base styles
        let base = "border transition-all duration-150 cursor-crosshair hover:scale-125 hover:z-10 hover:shadow-lg ";
        
        switch (pod.status) {
            case "Running":
                // Intensidade baseada na carga (Verde mais claro ou mais escuro)
                // Usamos opacidade no background para dar o efeito de densidade
                const opacity = 40 + (pod.loadIntensity / 2); // Min 40%, Max 90%
                return base + `bg-emerald-500/${Math.floor(opacity)} border-emerald-500/30 hover:border-emerald-300`;
            
            case "Pending":
                return base + "bg-amber-500/60 border-amber-500/50 hover:border-amber-300 animate-pulse";
            
            case "Failed":
            case "CrashLoopBackOff":
                return base + "bg-red-600/80 border-red-500 hover:border-red-300 shadow-[0_0_5px_rgba(220,38,38,0.5)]";
            
            case "Completed":
                 return base + "bg-zinc-700/50 border-zinc-600/30";
            default:
                return base + "bg-zinc-800";
        }
    };

    return (
        <div className="w-full min-h-screen bg-zinc-950 p-8 font-sans flex justify-center">
            
            <div className="w-full max-w-5xl">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
                            Distribuição de Workloads
                        </h2>
                        <p className="text-sm text-zinc-400 mt-1">Densidade de Pods por Nó do Cluster</p>
                    </div>
                    {/* Legenda Rápida */}
                    <div className="flex gap-3 text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500/80 rounded-sm"></div>Running</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500/60 rounded-sm"></div>Pending</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-600/80 rounded-sm"></div>Erro</div>
                    </div>
                </div>

                {/* --- CONTAINER DOS NÓS --- */}
                <div className="flex flex-col gap-6">
                    {data.map((node) => (
                        <div key={node.name} className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 relative overflow-hidden">
                            
                            {/* Background Grid Effect (Scanlines sutis) */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.2)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none z-0"></div>

                            {/* Cabeçalho do Nó */}
                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-sm font-bold text-zinc-200 font-mono">{node.name}</h3>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500 uppercase tracking-wide">{node.role}</span>
                                </div>
                                <div className="text-xs text-zinc-500 flex gap-3 font-mono">
                                    <span>CPU: {node.capacity.cpu}</span>
                                    <span>MEM: {node.capacity.memory}</span>
                                    <span className="text-zinc-300 ml-2">{node.pods.length} Pods</span>
                                </div>
                            </div>

                            {/* --- O GRID DE DENSIDADE (A "Colmeia") --- */}
                            {/* grid-cols-[repeat(auto-fill,minmax(12px,1fr))] cria o efeito de matriz densa */}
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-1 relative z-10">
                                {node.pods.map((pod) => (
                                    <div 
                                        key={pod.id}
                                        // w-3.5 h-5 (14px x 20px) -> Aspecto retangular vertical estilo "chip"
                                        className={`h-5 rounded-[2px] ${getPodStyle(pod)}`}
                                        onMouseEnter={(e) => setHoveredPod({ pod, rect: e.currentTarget.getBoundingClientRect() })}
                                        onMouseLeave={() => setHoveredPod(null)}
                                    />
                                ))}
                                {/* Preenchimento de slots vazios para dar sensação de capacidade total */}
                                {Array.from({ length: Math.max(0, 80 - node.pods.length) }).map((_, i) => (
                                     <div key={`empty-${i}`} className="h-5 rounded-[2px] bg-zinc-800/30 border border-zinc-800/20"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- TOOLTIP HUD (Estilo "Heads Up Display") --- */}
            {hoveredPod && (
                <div 
                    className="fixed bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 p-3 rounded-lg shadow-2xl z-50 pointer-events-none transition-all w-64"
                    style={{ 
                        left: hoveredPod.rect.left + (hoveredPod.rect.width / 2), 
                        top: hoveredPod.rect.top - 8,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    {/* Linha decorativa no topo do tooltip */}
                    <div className={`absolute top-0 left-2 right-2 h-[2px] ${hoveredPod.pod.status === 'Running' ? 'bg-emerald-500' : hoveredPod.pod.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`}></div>

                    <h4 className="text-xs font-bold text-zinc-100 truncate mb-1 font-mono mt-1">{hoveredPod.pod.name}</h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">NS: {hoveredPod.pod.namespace}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-zinc-800/50 p-2 rounded border border-zinc-800">
                            <p className="text-[9px] text-zinc-500 uppercase">Status</p>
                            <p className={`font-bold ${hoveredPod.pod.status === 'Running' ? 'text-emerald-400' : hoveredPod.pod.status.includes('BackOff') ? 'text-red-400' : 'text-amber-400'}`}>
                                {hoveredPod.pod.status}
                            </p>
                        </div>
                        <div className="bg-zinc-800/50 p-2 rounded border border-zinc-800">
                             <p className="text-[9px] text-zinc-500 uppercase">Carga Est.</p>
                             {/* Barra de carga mini */}
                             <div className="flex items-center gap-1 mt-1">
                                <div className="h-1.5 flex-1 bg-zinc-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${hoveredPod.pod.loadIntensity > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${hoveredPod.pod.loadIntensity}%` }}></div>
                                </div>
                                <span className="text-[9px] font-mono">{hoveredPod.pod.loadIntensity}%</span>
                             </div>
                        </div>
                    </div>
                    {/* Setinha */}
                    <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-zinc-900 border-r border-b border-zinc-700 rotate-45"></div>
                </div>
            )}
        </div>
    );
}