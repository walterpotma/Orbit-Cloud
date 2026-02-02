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

// --- DADOS FAKES (Comparação Limite vs Uso) ---
// Valores normalizados de 0 a 100 para o gráfico, mas mantemos o valor real para exibição
const metrics = [
    { label: "CPU", usage: 45, limit: 80, unit: "%" },
    { label: "Memory", usage: 72, limit: 90, unit: "%" },
    { label: "Disk I/O", usage: 30, limit: 100, unit: "IOPS" },
    { label: "Network", usage: 85, limit: 95, unit: "Mbps" },
    { label: "Threads", usage: 20, limit: 60, unit: "#" },
];

export default function ResourceRadarChart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerDimensions(containerRef);
    
    // --- CONFIGURAÇÕES ---
    const safeWidth = width || 400;
    const safeHeight = height || 400;
    const centerX = safeWidth / 2;
    const centerY = safeHeight / 2;
    
    // Raio máximo (deixa espaço para os labels)
    const radius = Math.min(safeWidth, safeHeight) / 2 - 40;
    
    // Número de eixos (lados do polígono)
    const count = metrics.length;
    // Ângulo entre cada eixo (em radianos)
    const angleStep = (Math.PI * 2) / count;

    // --- FUNÇÕES MATEMÁTICAS POLARES ---
    
    // Converte (Valor, Índice) -> Coordenada (X, Y)
    // value: 0 a 100
    const getPoint = (value: number, index: number, offsetRadius: number = 0) => {
        // Gira -90 graus (-PI/2) para o primeiro ponto ficar no topo (12 horas)
        const angle = (index * angleStep) - (Math.PI / 2);
        const r = (value / 100) * (radius + offsetRadius);
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return { x, y };
    };

    // Gera o "caminho" (string d) para um polígono fechado
    const generatePolygonPath = (dataKey: 'usage' | 'limit') => {
        const points = metrics.map((m, i) => {
            const { x, y } = getPoint(m[dataKey], i);
            return `${x},${y}`;
        });
        return points.join(" ");
    };

    // Gera os polígonos de grade (background)
    // levels = 4 significa grades em 25%, 50%, 75%, 100%
    const gridLevels = [25, 50, 75, 100];

    return (
        <div className="w-full min-h-screen bg-zinc-950 flex justify-center items-center p-8 font-sans">
            
            <div className="w-full max-w-lg bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl relative overflow-hidden">
                
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-100">Eficiência de Pod</h2>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Uso vs. Alocação (Limits)</p>
                    </div>
                    {/* Legenda */}
                    <div className="flex flex-col gap-1 text-[10px] uppercase font-bold">
                        <div className="flex items-center gap-1.5 text-cyan-400">
                            <div className="w-2 h-0.5 bg-cyan-400"></div> Limite
                        </div>
                        <div className="flex items-center gap-1.5 text-fuchsia-400">
                            <div className="w-2 h-2 bg-fuchsia-500/50 border border-fuchsia-400"></div> Uso Real
                        </div>
                    </div>
                </div>

                <div ref={containerRef} className="w-full h-[400px] relative">
                    
                    {safeWidth > 0 && (
                        <svg width={safeWidth} height={safeHeight} className="overflow-visible">
                            
                            <defs>
                                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#18181b" stopOpacity="0" />
                                    <stop offset="100%" stopColor="#18181b" stopOpacity="0.5" />
                                </radialGradient>
                                <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* --- BACKGROUND GRID (Teia de Aranha) --- */}
                            {gridLevels.map((level) => (
                                <polygon
                                    key={level}
                                    points={metrics.map((_, i) => {
                                        const { x, y } = getPoint(level, i);
                                        return `${x},${y}`;
                                    }).join(" ")}
                                    fill="none"
                                    stroke="#27272a"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                            ))}

                            {/* --- EIXOS (Linhas do centro para fora) --- */}
                            {metrics.map((_, i) => {
                                const { x, y } = getPoint(100, i);
                                return (
                                    <line
                                        key={i}
                                        x1={centerX} y1={centerY}
                                        x2={x} y2={y}
                                        stroke="#27272a"
                                        strokeWidth="1"
                                    />
                                );
                            })}

                            {/* --- CAMADA 1: LIMITES (A "Caixa" Externa) --- */}
                            <polygon
                                points={generatePolygonPath('limit')}
                                fill="none"
                                stroke="#22d3ee" // Cyan
                                strokeWidth="2"
                                strokeOpacity="0.5"
                                strokeDasharray="5 2" // Tracejado para indicar "limite teórico"
                                filter="url(#glow-line)"
                            />

                            {/* --- CAMADA 2: USO REAL (O Preenchimento) --- */}
                            <g className="drop-shadow-[0_0_10px_rgba(217,70,239,0.3)]">
                                <polygon
                                    points={generatePolygonPath('usage')}
                                    fill="#d946ef" // Fuchsia
                                    fillOpacity="0.2"
                                    stroke="#d946ef"
                                    strokeWidth="2"
                                >
                                    {/* Animação suave ao carregar */}
                                    <animate 
                                        attributeName="opacity" 
                                        from="0" to="1" 
                                        dur="1s" 
                                    />
                                </polygon>
                            </g>

                            {/* --- PONTOS E LABELS INTERATIVOS --- */}
                            {metrics.map((m, i) => {
                                // Posição do ponto de uso
                                const usagePos = getPoint(m.usage, i);
                                // Posição do Label (um pouco mais para fora do raio 100%)
                                const labelPos = getPoint(100, i, 25); 

                                return (
                                    <g key={i} className="group">
                                        
                                        {/* Círculo no vértice de uso */}
                                        <circle
                                            cx={usagePos.x} cy={usagePos.y} r="4"
                                            fill="#18181b" stroke="#d946ef" strokeWidth="2"
                                            className="transition-all duration-300 group-hover:r-6 group-hover:fill-fuchsia-500 cursor-crosshair"
                                        />

                                        {/* Label do Eixo (CPU, RAM...) */}
                                        <text
                                            x={labelPos.x} y={labelPos.y}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill="#a1a1aa"
                                            fontSize="10"
                                            fontWeight="bold"
                                            className="uppercase tracking-wider"
                                        >
                                            {m.label}
                                        </text>

                                        {/* TOOLTIP FLUTUANTE (Aparece ao lado do ponto) */}
                                        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                            <rect
                                                x={usagePos.x - 40} y={usagePos.y - 35}
                                                width="80" height="28"
                                                rx="4"
                                                fill="#18181b" stroke="#3f3f46"
                                            />
                                            <text
                                                x={usagePos.x} y={usagePos.y - 21}
                                                textAnchor="middle" dominantBaseline="middle"
                                                fill="white" fontSize="10" fontWeight="bold"
                                            >
                                                {m.usage}{m.unit} / {m.limit}{m.unit}
                                            </text>
                                        </g>
                                    </g>
                                );
                            })}

                            {/* Elemento Decorativo Central (Mira) */}
                            <circle cx={centerX} cy={centerY} r="2" fill="#52525b" />
                            <circle cx={centerX} cy={centerY} r="15" fill="none" stroke="#52525b" strokeWidth="0.5" opacity="0.5" />

                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}