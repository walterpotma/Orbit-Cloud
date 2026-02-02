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

// --- DADOS FAKES (Arquitetura de um Microsserviço de Pagamentos) ---
const coreService = { name: "Payment Domain Core", status: "healthy" };

const adapters = [
    // Inbound (Entrada - Esquerda)
    { id: "rest", name: "REST API (HTTP)", type: "inbound", side: "left" },
    { id: "grpc", name: "gRPC Server", type: "inbound", side: "left" },
    { id: "kafka-in", name: "Kafka Consumer", type: "inbound", side: "left" },
    // Outbound (Saída - Direita)
    { id: "postgres", name: "PostgreSQL DB", type: "outbound", side: "right" },
    { id: "redis", name: "Redis Cache", type: "outbound", side: "right" },
    { id: "stripe", name: "Stripe Gateway", type: "outbound", side: "right" },
];

export default function HexagonalArchitectureView() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerDimensions(containerRef as React.RefObject<HTMLDivElement>);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // --- CONFIGURAÇÕES GEOMÉTRICAS ---
    const safeWidth = width || 600;
    const safeHeight = height || 400;
    const centerX = safeWidth / 2;
    const centerY = safeHeight / 2;

    const coreRadius = 70;   // Tamanho do hexágono central
    const adapterRadius = 50; // Tamanho dos hexágonos laterais
    const orbitDistance = 160; // Distância do centro até os adaptadores

    // --- MATEMÁTICA DE HEXÁGONO (A mágica acontece aqui) ---
    // Gera os pontos "x,y x,y ..." para a tag <polygon>
    const createHexagonPoints = (cx: number, cy: number, r: number) => {
        const points = [];
        for (let i = 0; i < 6; i++) {
            // Ângulo em graus: 0, 60, 120, 180, 240, 300
            // Adicionamos 30 graus para ele ficar com a "ponta" para cima
            const angleDeg = 60 * i + 30; 
            const angleRad = (Math.PI / 180) * angleDeg;
            const x = cx + r * Math.cos(angleRad);
            const y = cy + r * Math.sin(angleRad);
            points.push(`${x},${y}`);
        }
        return points.join(" ");
    };

    // --- POSICIONAMENTO DOS ADAPTADORES ---
    const positionedAdapters = useMemo(() => {
        const leftAdapters = adapters.filter(a => a.side === "left");
        const rightAdapters = adapters.filter(a => a.side === "right");

        const calculatePositions = (items: typeof adapters, startAngle: number) => {
            const angleStep = 45; // Graus de separação entre eles
            // Centraliza o arco de itens
            const totalArc = (items.length - 1) * angleStep;
            const initialOffset = startAngle - (totalArc / 2);

            return items.map((item, i) => {
                const angleDeg = initialOffset + (i * angleStep);
                const angleRad = (Math.PI / 180) * angleDeg;
                return {
                    ...item,
                    x: centerX + orbitDistance * Math.cos(angleRad),
                    y: centerY + orbitDistance * Math.sin(angleRad),
                };
            });
        };

        // Esquerda: Ângulo central 180 graus
        const leftPos = calculatePositions(leftAdapters, 180);
        // Direita: Ângulo central 0 graus
        const rightPos = calculatePositions(rightAdapters, 0);
        
        return [...leftPos, ...rightPos];
    }, [centerX, centerY, orbitDistance]);

    // Cores Neon
    const coreColor = "#3b82f6"; // Blue
    const inboundColor = "#10b981"; // Emerald
    const outboundColor = "#f472b6"; // Pink

    return (
        <div className="w-full min-h-screen bg-zinc-950 flex justify-center items-center p-8 font-sans">
            
            <div className="w-full max-w-4xl bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl relative overflow-hidden">
                <div className="mb-2 relative z-10 pointer-events-none">
                    <h2 className="text-lg font-bold text-zinc-100">Arquitetura de Serviço</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Modelo Hexagonal (Ports & Adapters)</p>
                </div>

                <div ref={containerRef} className="w-full h-[450px] relative select-none">
                    {safeWidth > 0 && (
                        <svg width={safeWidth} height={safeHeight} className="absolute top-0 left-0 overflow-visible">
                            <defs>
                                {/* Filtro de Brilho Neon */}
                                <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                                {/* Gradientes de Conexão */}
                                <linearGradient id="grad-inbound" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor={inboundColor} stopOpacity="0.6"/>
                                    <stop offset="100%" stopColor={coreColor} stopOpacity="0.6"/>
                                </linearGradient>
                                <linearGradient id="grad-outbound" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor={coreColor} stopOpacity="0.6"/>
                                    <stop offset="100%" stopColor={outboundColor} stopOpacity="0.6"/>
                                </linearGradient>
                            </defs>

                            {/* --- CONEXÕES (Linhas do centro aos adaptadores) --- */}
                            {positionedAdapters.map((adapter) => {
                                const isHovered = hoveredId === adapter.id || hoveredId === 'core';
                                const gradientId = adapter.side === 'left' ? 'url(#grad-inbound)' : 'url(#grad-outbound)';
                                
                                return (
                                    <g key={`link-${adapter.id}`} className="transition-all duration-300" style={{ opacity: isHovered ? 1 : 0.3 }}>
                                        {/* Linha grossa brilhante */}
                                        <line
                                            x1={centerX} y1={centerY}
                                            x2={adapter.x} y2={adapter.y}
                                            stroke={gradientId}
                                            strokeWidth={isHovered ? 4 : 2}
                                            strokeLinecap="round"
                                            filter="url(#neon-glow)"
                                        />
                                        {/* Linha fina central */}
                                        <line
                                            x1={centerX} y1={centerY}
                                            x2={adapter.x} y2={adapter.y}
                                            stroke="white"
                                            strokeWidth="0.5"
                                            strokeOpacity="0.5"
                                        />
                                        {/* Partícula viajando (Animação de fluxo) */}
                                        {isHovered && (
                                            <circle r="3" fill="white">
                                                <animateMotion 
                                                    dur="1.5s" 
                                                    repeatCount="indefinite"
                                                    // Inverte a direção dependendo se é entrada ou saída
                                                    path={`M${adapter.side === 'left' ? `${adapter.x},${adapter.y} L${centerX},${centerY}` : `${centerX},${centerY} L${adapter.x},${adapter.y}`}`}
                                                />
                                            </circle>
                                        )}
                                    </g>
                                );
                            })}

                            {/* --- O NÚCLEO (Core Hexagon) --- */}
                            <g 
                                onMouseEnter={() => setHoveredId('core')}
                                onMouseLeave={() => setHoveredId(null)}
                                className="cursor-pointer"
                            >
                                {/* Hexágono Sólido Central */}
                                <polygon
                                    points={createHexagonPoints(centerX, centerY, coreRadius)}
                                    fill="#1e293b" // Zinc-800ish
                                    stroke={coreColor}
                                    strokeWidth="3"
                                    filter="url(#neon-glow)"
                                    className="transition-all duration-300 hover:stroke-[4px] hover:fill-blue-950"
                                />
                                {/* Texto Central */}
                                <text x={centerX} y={centerY - 10} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                                    DOMÍNIO CORE
                                </text>
                                <text x={centerX} y={centerY + 10} textAnchor="middle" fill={coreColor} fontSize="10" className="uppercase tracking-widest">
                                    Business Logic
                                </text>
                                {/* Ícone central pulsante */}
                                <circle cx={centerX} cy={centerY} r="5" fill={coreColor} className="animate-ping opacity-75" style={{ animationDuration: '3s' }} />
                            </g>

                            {/* --- ADAPTADORES (Hexágonos Externos) --- */}
                            {positionedAdapters.map((adapter) => {
                                const isHovered = hoveredId === adapter.id;
                                const color = adapter.side === 'left' ? inboundColor : outboundColor;

                                return (
                                    <g 
                                        key={adapter.id}
                                        transform={`translate(${adapter.x}, ${adapter.y})`}
                                        onMouseEnter={() => setHoveredId(adapter.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        className="cursor-pointer group"
                                    >
                                        {/* Hexágono do Adaptador */}
                                        <polygon
                                            points={createHexagonPoints(0, 0, adapterRadius)}
                                            fill="#18181b"
                                            stroke={color}
                                            strokeWidth={isHovered ? 3 : 1.5}
                                            filter={isHovered ? "url(#neon-glow)" : ""}
                                            className="transition-all duration-300 group-hover:scale-110"
                                        />
                                        
                                        {/* Label do Tipo (Inbound/Outbound) acima do hexágono */}
                                        <text x="0" y={-adapterRadius - 10} textAnchor="middle" fill={color} fontSize="9" fontWeight="bold" className="uppercase tracking-widest opacity-70">
                                            {adapter.type}
                                        </text>

                                        {/* Nome do Adaptador (Quebra de linha manual com tspan) */}
                                        <text x="0" y="0" textAnchor="middle" fill="white" fontSize="10" fontWeight="medium">
                                            {adapter.name.split(' ').map((word, i, arr) => (
                                                // Centraliza verticalmente baseado no número de palavras
                                                <tspan key={i} x="0" dy={i === 0 ? `-${(arr.length - 1) * 0.5}em` : "1.1em"}>
                                                    {word}
                                                </tspan>
                                            ))}
                                        </text>
                                    </g>
                                )
                            })}
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}