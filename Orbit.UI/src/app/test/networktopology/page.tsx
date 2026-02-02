"use client";

import { useState, useRef, useEffect, useMemo } from "react";

// --- HOOK DE REDIMENSIONAMENTO ---
const useContainerDimensions = (myRef: React.RefObject<HTMLDivElement>) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (!myRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(myRef.current);
        return () => resizeObserver.disconnect();
    }, [myRef]);
    return dimensions;
};

// --- DADOS (Seus serviços na Orbit Cloud) ---
const services = [
    { id: "front", label: "Dashboard Front", type: "app", status: "ok" },
    { id: "api", label: "Orbit API", type: "api", status: "ok" },
    { id: "db", label: "Postgres Primary", type: "db", status: "warning" }, // Warning simulado
    { id: "redis", label: "Redis Cache", type: "db", status: "ok" },
    { id: "auth", label: "Auth Service", type: "security", status: "ok" },
    { id: "worker", label: "Background Jobs", type: "worker", status: "error" }, // Erro simulado
    { id: "storage", label: "S3 Storage", type: "storage", status: "ok" },
    { id: "logs", label: "Log Collector", type: "monitoring", status: "ok" },
];

export default function NetworkTopologyMap() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerDimensions(containerRef);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // --- CONFIGURAÇÕES ---
    const centerNodeSize = 60; // Tamanho do nó central
    const nodeSize = 40;       // Tamanho dos satélites
    const iconSize = 20;       // Tamanho dos ícones (simulados)

    const safeWidth = width || 400;
    const safeHeight = height || 400;
    const centerX = safeWidth / 2;
    const centerY = safeHeight / 2;

    // Raio da órbita (distância do centro)
    // Pega o menor lado da tela e usa 35% dele como raio
    const orbitRadius = Math.min(safeWidth, safeHeight) * 0.35;

    // --- CÁLCULOS TRIGONOMÉTRICOS ---
    const nodesWithPosition = useMemo(() => {
        const total = services.length;
        // Divide o círculo (360 graus ou 2PI radianos) pelo número de itens
        const angleStep = (2 * Math.PI) / total;

        return services.map((service, index) => {
            // Calcula o ângulo deste nó (começando de -90 graus / topo)
            const angle = (index * angleStep) - (Math.PI / 2);
            
            // FÓRMULA MÁGICA: Converte ângulo em X,Y
            // x = centroX + (raio * cos(angulo))
            // y = centroY + (raio * sen(angulo))
            const x = centerX + (orbitRadius * Math.cos(angle));
            const y = centerY + (orbitRadius * Math.sin(angle));

            return { ...service, x, y, angle };
        });
    }, [centerX, centerY, orbitRadius]);

    // --- CORES ---
    const getStatusColor = (status: string) => {
        switch (status) {
            case "ok": return "#10b981"; // Emerald
            case "warning": return "#f59e0b"; // Amber
            case "error": return "#ef4444"; // Red
            default: return "#71717a";
        }
    };

    return (
        <div className="w-full min-h-screen bg-zinc-950 flex justify-center items-center p-8 font-sans">
            
            <div className="w-full max-w-4xl bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl overflow-hidden relative">
                
                <div className="absolute top-6 left-6 z-10">
                    <h2 className="text-lg font-bold text-zinc-100">Topologia de Rede</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Status em tempo real</p>
                </div>

                {/* Legenda simples */}
                <div className="absolute top-6 right-6 z-10 flex gap-3 text-[10px] font-bold uppercase text-zinc-500">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>OK</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Lento</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Erro</div>
                </div>

                <div ref={containerRef} className="w-full h-[500px] relative select-none cursor-move active:cursor-grabbing">
                    
                    {safeWidth > 0 && (
                        <svg width={safeWidth} height={safeHeight} className="overflow-visible">
                            
                            {/* Definições de Filtros (Glow Effect) */}
                            <defs>
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>

                                {/* Animação de "Pacote de Dados" viajando na linha */}
                                <circle id="packet" r="3" fill="white">
                                    <animate 
                                        attributeName="opacity" 
                                        values="0;1;0" 
                                        dur="2s" 
                                        repeatCount="indefinite" 
                                    />
                                </circle>
                            </defs>

                            {/* --- ANÉIS ORBITAIS (Decorativo) --- */}
                            <circle cx={centerX} cy={centerY} r={orbitRadius} fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                            <circle cx={centerX} cy={centerY} r={orbitRadius * 0.6} fill="none" stroke="#27272a" strokeWidth="1" strokeOpacity="0.5" />


                            {/* --- CONEXÕES (Linhas) --- */}
                            {nodesWithPosition.map((node) => {
                                const isHovered = hoveredNode === node.id;
                                const color = getStatusColor(node.status);

                                return (
                                    <g key={`link-${node.id}`}>
                                        {/* Linha base */}
                                        <line
                                            x1={centerX} y1={centerY}
                                            x2={node.x} y2={node.y}
                                            stroke={isHovered ? color : "#27272a"}
                                            strokeWidth={isHovered ? 2 : 1}
                                            className="transition-all duration-300"
                                        />
                                        
                                        {/* Bolinha viajando (Simula tráfego) */}
                                        {/* Só mostramos o tráfego se estiver OK ou Warning */}
                                        {node.status !== 'error' && (
                                            <circle r="2" fill={color}>
                                                <animateMotion 
                                                    dur={`${Math.random() * 2 + 1}s`} // Velocidade aleatória
                                                    repeatCount="indefinite"
                                                    path={`M${centerX},${centerY} L${node.x},${node.y}`}
                                                />
                                            </circle>
                                        )}
                                    </g>
                                );
                            })}


                            {/* --- NÓ CENTRAL (Internet/Gateway) --- */}
                            <g className="transition-transform duration-300 hover:scale-110" style={{ transformOrigin: `${centerX}px ${centerY}px` }}>
                                {/* Glow externo */}
                                <circle cx={centerX} cy={centerY} r={centerNodeSize / 2 + 10} fill="#3b82f6" fillOpacity="0.1" className="animate-pulse" />
                                {/* Círculo Sólido */}
                                <circle 
                                    cx={centerX} cy={centerY} r={centerNodeSize / 2} 
                                    fill="#1e1e20" stroke="#3b82f6" strokeWidth="2" 
                                    filter="url(#glow)"
                                />
                                {/* Ícone/Texto Central */}
                                <text x={centerX} y={centerY} dy=".3em" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">ORBIT</text>
                            </g>


                            {/* --- NÓS SATÉLITES --- */}
                            {nodesWithPosition.map((node) => {
                                const isHovered = hoveredNode === node.id;
                                const color = getStatusColor(node.status);

                                return (
                                    <g 
                                        key={node.id}
                                        onMouseEnter={() => setHoveredNode(node.id)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                        className="cursor-pointer transition-all duration-300"
                                        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                                    >
                                        {/* Efeito de "Onda" se der erro */}
                                        {node.status === 'error' && (
                                             <circle cx={node.x} cy={node.y} r={nodeSize} fill="none" stroke={color} strokeWidth="1" opacity="0.5">
                                                 <animate attributeName="r" from={nodeSize/2} to={nodeSize} dur="1.5s" repeatCount="indefinite" />
                                                 <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                                             </circle>
                                        )}

                                        {/* Círculo do Nó */}
                                        <circle 
                                            cx={node.x} cy={node.y} 
                                            r={isHovered ? nodeSize / 1.8 : nodeSize / 2} 
                                            fill="#18181b" 
                                            stroke={color} 
                                            strokeWidth={isHovered ? 3 : 2}
                                            className="transition-all duration-300"
                                            filter={isHovered ? "url(#glow)" : ""}
                                        />

                                        {/* Label (Iniciais do Serviço) */}
                                        <text 
                                            x={node.x} y={node.y} dy=".3em" 
                                            textAnchor="middle" 
                                            fill={isHovered ? "white" : "#a1a1aa"} 
                                            fontSize="10" fontWeight="bold"
                                            className="pointer-events-none"
                                        >
                                            {node.label.substring(0, 2).toUpperCase()}
                                        </text>

                                        {/* Tooltip Fixo perto do nó (mas desenhado no SVG) */}
                                        {/* Usamos um rect + text simples para performance */}
                                        <g transform={`translate(${node.x}, ${node.y + nodeSize/2 + 10})`}>
                                            <text 
                                                textAnchor="middle" 
                                                fill={color} 
                                                fontSize="10" 
                                                fontWeight="bold"
                                                opacity={isHovered ? 1 : 0.6}
                                                className="uppercase tracking-wider transition-opacity duration-300"
                                            >
                                                {node.label}
                                            </text>
                                            <text 
                                                y="12"
                                                textAnchor="middle" 
                                                fill="#52525b" 
                                                fontSize="8" 
                                                className="uppercase"
                                            >
                                                {node.type} • {node.status}
                                            </text>
                                        </g>
                                    </g>
                                );
                            })}

                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}