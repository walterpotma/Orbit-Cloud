"use client";

import { useState, useRef, useEffect, useMemo } from "react";
// CORREÇÃO 1: Substituindo react-icons por lucide-react (padrão do projeto)
import { UserPlus, Activity, Heart, DollarSign, Award } from "lucide-react";

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

// --- DADOS FAKES (Estágios do Funil) ---
const journeyStages = [
    { id: "acquisition", label: "Aquisição", count: 15420, color: "#22d3ee", Icon: UserPlus, churnRate: 0.0 }, // Cyan
    { id: "activation", label: "Ativação", count: 8500, color: "#3b82f6", Icon: Activity, churnRate: 0.45 }, // Blue
    { id: "retention", label: "Retenção", count: 4200, color: "#8b5cf6", Icon: Heart, churnRate: 0.50 }, // Violet
    { id: "revenue", label: "Receita (Pro)", count: 1800, color: "#d946ef", Icon: DollarSign, churnRate: 0.57 }, // Fuchsia
    { id: "loyalty", label: "Lealdade (Advocate)", count: 450, color: "#f43f5e", Icon: Award, churnRate: 0.75 }, // Rose
];

export default function CustomerJourneyMap() {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // CORREÇÃO 2: Type Casting para resolver o erro do Ref null
    const { width, height } = useContainerDimensions(containerRef as React.RefObject<HTMLDivElement>);
    
    const [hoveredStage, setHoveredStage] = useState<string | null>(null);

    // --- CONFIGURAÇÕES GEOMÉTRICAS ---
    const safeWidth = width || 800;
    const safeHeight = height || 400;
    const centerY = safeHeight / 2;
    const marginX = 80;
    const usableWidth = safeWidth - (marginX * 2);
    
    const nodeRadiusBase = 35; // Tamanho base do nó
    const maxCount = Math.max(...journeyStages.map(s => s.count));

    // --- CÁLCULO DE POSIÇÕES ---
    const stagePositions = useMemo(() => {
        const stepX = usableWidth / (journeyStages.length - 1);
        return journeyStages.map((stage, i) => ({
            ...stage,
            x: marginX + (stepX * i),
            y: centerY,
            // Escala o tamanho do nó baseado na contagem de usuários
            scaledRadius: nodeRadiusBase + (nodeRadiusBase * 0.5 * (stage.count / maxCount))
        }));
    }, [safeWidth, centerY, maxCount, usableWidth]); // Adicionei usableWidth nas dependências

    return (
        <div className="w-full min-h-screen bg-zinc-950 flex justify-center items-center p-8 font-sans">
            
            <div className="w-full max-w-5xl bg-zinc-900 rounded-xl border border-zinc-800 p-8 shadow-2xl relative overflow-hidden">
                
                <div className="mb-8 relative z-10 pointer-events-none flex justify-between items-end">
                   <div>
                        <h2 className="text-xl font-bold text-zinc-100">Jornada do Cliente</h2>
                        <p className="text-sm text-zinc-500 mt-1">Fluxo de conversão e saúde do funil</p>
                   </div>
                   <div className="text-right">
                        <p className="text-2xl font-bold text-zinc-100">{new Intl.NumberFormat('pt-BR').format(journeyStages[0].count)}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Total de Leads</p>
                   </div>
                </div>

                {/* CORREÇÃO 3: Mantive h-[350px] mas o ideal seria mover para style={{ height: 350 }} se o tailwind reclamar muito */}
                <div ref={containerRef} className="w-full h-[350px] relative select-none">
                    {safeWidth > 0 && (
                        <svg width={safeWidth} height={safeHeight} className="absolute top-0 left-0 overflow-visible">
                            <defs>
                                {/* Filtro de Brilho Neon */}
                                <filter id="journey-glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                                
                                {/* Gradiente Linear Animado para os Conectores */}
                                {stagePositions.map((stage, i) => {
                                    if (i === stagePositions.length - 1) return null;
                                    const nextStage = stagePositions[i+1];
                                    return (
                                        <linearGradient key={`flow-grad-${i}`} id={`flow-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor={stage.color} stopOpacity="0.3" />
                                            <stop offset="100%" stopColor={nextStage.color} stopOpacity="0.3" />
                                            {/* Animação do fluxo */}
                                            <animate attributeName="x1" values="0%;100%" dur="3s" repeatCount="indefinite" />
                                            <animate attributeName="x2" values="100%;200%" dur="3s" repeatCount="indefinite" />
                                        </linearGradient>
                                    );
                                })}
                            </defs>


                            {/* --- CONECTORES (O Pipeline) --- */}
                            {stagePositions.map((stage, i) => {
                                if (i === stagePositions.length - 1) return null;
                                const nextStage = stagePositions[i+1];
                                // Calcula a taxa de conversão para definir a espessura da linha
                                const conversionRate = nextStage.count / stage.count;
                                const thickness = 40 * conversionRate;

                                return (
                                    <g key={`link-${i}`}>
                                        {/* Linha de fundo sólida */}
                                        <line
                                            x1={stage.x} y1={stage.y}
                                            x2={nextStage.x} y2={nextStage.y}
                                            stroke="#27272a"
                                            strokeWidth={thickness}
                                            strokeLinecap="round"
                                        />
                                        {/* Linha de fluxo animada */}
                                        <line
                                            x1={stage.x} y1={stage.y}
                                            x2={nextStage.x} y2={nextStage.y}
                                            stroke={`url(#flow-grad-${i})`}
                                            strokeWidth={thickness}
                                            strokeLinecap="round"
                                        />
                                        {/* Label da Taxa de Conversão */}
                                        <text
                                            x={(stage.x + nextStage.x) / 2}
                                            y={stage.y - (thickness/2) - 10}
                                            textAnchor="middle"
                                            fill="#71717a"
                                            fontSize="10"
                                            fontWeight="bold"
                                        >
                                            {Math.round(conversionRate * 100)}% Conversão
                                        </text>
                                    </g>
                                )
                            })}

                            {/* --- NÓS DOS ESTÁGIOS --- */}
                            {stagePositions.map((stage, i) => {
                                const isHovered = hoveredStage === stage.id;
                                // Calcula quantos usuários foram perdidos (Churn) neste passo
                                const previousCount = i > 0 ? stagePositions[i-1].count : stage.count;
                                const droppedUsers = Math.round(previousCount * stage.churnRate);

                                return (
                                    <g 
                                            key={stage.id}
                                            transform={`translate(${stage.x}, ${stage.y})`}
                                            onMouseEnter={() => setHoveredStage(stage.id)}
                                            onMouseLeave={() => setHoveredStage(null)}
                                            className="cursor-pointer group"
                                    >
                                        {/* Círculo Externo (Brilho) */}
                                        <circle
                                            r={stage.scaledRadius + (isHovered ? 5 : 0)}
                                            fill={stage.color}
                                            fillOpacity="0.1"
                                            stroke={stage.color}
                                            strokeWidth={isHovered ? 3 : 1.5}
                                            filter="url(#journey-glow)"
                                            className="transition-all duration-300"
                                        />
                                        
                                        {/* Círculo Interno (Sólido) */}
                                        <circle
                                            r={stage.scaledRadius - 5}
                                            fill="#18181b" // Zinc-900
                                            className="transition-all duration-300 group-hover:fill-zinc-800"
                                        />

                                        {/* Ícone Central */}
                                        <foreignObject x={-15} y={-15} width="30" height="30">
                                            <div className="w-full h-full flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
                                                <stage.Icon size={20} />
                                            </div>
                                        </foreignObject>

                                        {/* Labels Inferiores (Nome e Contagem) */}
                                        <text y={stage.scaledRadius + 20} textAnchor="middle" fill={isHovered ? "white" : "#a1a1aa"} fontSize="12" fontWeight="bold" className="transition-colors">
                                            {stage.label}
                                        </text>
                                        <text y={stage.scaledRadius + 35} textAnchor="middle" fill={stage.color} fontSize="14" fontWeight="black" fontFamily="monospace">
                                            {new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(stage.count)}
                                        </text>

                                        {/* --- INDICADOR DE CHURN (Perda) --- */}
                                        {i > 0 && stage.churnRate > 0 && (
                                            <g transform={`translate(0, ${stage.scaledRadius + 55})`} className="opacity-60 hover:opacity-100 transition-opacity">
                                                {/* Seta para baixo */}
                                                <path d="M 0 0 L 0 15 M -4 11 L 0 15 L 4 11" stroke="#ef4444" strokeWidth="1.5" fill="none" />
                                                <text y={28} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
                                                    -{new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(droppedUsers)} (Drop)
                                                </text>
                                            </g>
                                        )}

                                        {/* TOOLTIP FLUTUANTE (Aparece acima) */}
                                        <g className="opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none" transform={`translate(0, -${stage.scaledRadius + 10})`}>
                                             <foreignObject x="-80" y="-70" width="160" height="60">
                                                <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl text-center relative">
                                                    <p className="text-xs text-zinc-400 uppercase font-bold mb-1">{stage.label}</p>
                                                    <p className="text-sm font-bold text-white">
                                                        {((stage.count / journeyStages[0].count) * 100).toFixed(1)}% do Total
                                                    </p>
                                                     {/* Setinha do tooltip - Agora dentro do foreignObject para não bugar o SVG */}
                                                    <div className="absolute left-1/2 bottom-[-5px] transform -translate-x-1/2 w-3 h-3 bg-zinc-800 border-r border-b border-zinc-700 rotate-45"></div>
                                                </div>
                                             </foreignObject>
                                        </g>
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