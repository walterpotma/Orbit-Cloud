"use client";

import { useState, useRef, useEffect, useMemo } from "react";

// 1. Definição do Tipo do Payload da API
interface ChartDataPoint {
    time: string;
    value: number;
}

interface ChartProps {
    tittle: string;
    subtittle: string;
    data: ChartDataPoint[]; // Recebe o array da API
}

// Hook para redimensionamento responsivo
const useContainerDimensions = (myRef: React.RefObject<HTMLDivElement | null>) => {
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

export default function ProfessionalChartPage({ tittle, subtittle, data = [] }: ChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerDimensions(containerRef);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Configurações de layout
    const padding = { top: 20, right: 30, bottom: 30, left: 50 }; // Aumentei left para caber os números decimais
    const safeWidth = width || 0;
    const safeHeight = height || 0;
    const chartWidth = safeWidth - (padding.left + padding.right);
    const chartHeight = safeHeight - (padding.top + padding.bottom);

    // 2. Cálculo do Max Y Dinâmico
    // Como os valores são pequenos (0.0005), calculamos o maior valor e adicionamos 10% de folga
    const maxY = useMemo(() => {
        if (data.length === 0) return 100;
        const maxVal = Math.max(...data.map(d => d.value));
        return maxVal === 0 ? 1 : maxVal * 1.1; 
    }, [data]);

    // Função para formatar hora (HH:mm) de forma segura para evitar Hydration Error
    const toHour = (datetime: string) => {
        if (!datetime) return "";
        try {
            return datetime.split('T')[1].substring(0, 5);
        } catch {
            return datetime;
        }
    };

    // Escalas X e Y
    const getX = (index: number) => {
        if (chartWidth <= 0 || data.length <= 1) return padding.left;
        return (index / (data.length - 1)) * chartWidth + padding.left;
    };

    const getY = (value: number) => {
        if (chartHeight <= 0) return padding.top;
        // Regra de três simples baseada no maxY calculado
        const percentage = value / maxY;
        return padding.top + (chartHeight - (chartHeight * percentage));
    };

    // Gera os pontos da linha (SVG Polyline)
    const linePoints = useMemo(() => {
        return data.map((p, i) => `${getX(i)},${getY(p.value)}`).join(" ");
    }, [data, chartWidth, chartHeight, maxY]);

    // Gera área preenchida abaixo da linha
    const areaPoints = `
        ${padding.left},${safeHeight - padding.bottom} 
        ${linePoints} 
        ${safeWidth - padding.right},${safeHeight - padding.bottom}
    `;

    // Gera 5 linhas de grade baseadas no maxY dinâmico
    const gridTicks = [0, 0.25, 0.5, 0.75, 1].map(t => t * maxY);

    return (
        <div className="w-full bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl overflow-hidden">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-zinc-100">{tittle}</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{subtittle}</p>
            </div>

            <div ref={containerRef} className="w-full h-[300px] relative select-none">
                {/* Fallback se não houver dados */}
                {data.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
                        Sem dados disponíveis
                    </div>
                )}

                <svg
                    width={safeWidth}
                    height={safeHeight}
                    className="absolute top-0 left-0 overflow-visible"
                >
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {safeWidth > 0 && data.length > 0 && (
                        <>
                            {/* EIXO Y (Linhas e Valores) */}
                            {gridTicks.map((tick, i) => {
                                const y = getY(tick);
                                return (
                                    <g key={i}>
                                        <line
                                            x1={padding.left} y1={y}
                                            x2={safeWidth - padding.right} y2={y}
                                            stroke="#27272a" strokeWidth="1"
                                        />
                                        <text
                                            x={padding.left - 10} y={y + 4}
                                            fill="#71717a" fontSize="10" textAnchor="end"
                                        >
                                            {/* Formata para 4 casas decimais pois os valores são pequenos */}
                                            {tick.toFixed(4)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* GRÁFICO (Área e Linha) */}
                            <polygon points={areaPoints} fill="url(#chartGradient)" />
                            <polyline
                                points={linePoints}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* INTERATIVIDADE (Linha vertical tracejada) */}
                            {hoveredIndex !== null && data[hoveredIndex] && (
                                <line
                                    x1={getX(hoveredIndex)} y1={padding.top}
                                    x2={getX(hoveredIndex)} y2={safeHeight - padding.bottom}
                                    stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4"
                                    className="opacity-50"
                                />
                            )}

                            {/* PONTOS INVISÍVEIS (Para área de hover) + PONTOS VISÍVEIS */}
                            {data.map((ponto, index) => {
                                const x = getX(index);
                                const y = getY(ponto.value);
                                const isHovered = hoveredIndex === index;

                                return (
                                    <g key={index}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {/* Texto do Eixo X (Hora) - Mostra apenas alguns para não poluir se houver muitos dados */}
                                        {(index % Math.ceil(data.length / 6) === 0 || index === data.length -1) && (
                                            <text
                                                x={x} y={safeHeight - 10}
                                                fill="#71717a" fontSize="10" textAnchor="middle"
                                            >
                                                {toHour(ponto.time)}
                                            </text>
                                        )}

                                        {/* Área de detecção de mouse transparente (Hitbox maior) */}
                                        <rect 
                                            x={x - (chartWidth / data.length / 2)} 
                                            y={padding.top} 
                                            width={chartWidth / data.length} 
                                            height={chartHeight} 
                                            fill="transparent" 
                                            className="cursor-crosshair"
                                        />

                                        {/* Ponto Visual (só aparece no hover ou se for o último) */}
                                        <circle
                                            cx={x} cy={y}
                                            r={isHovered ? 6 : 0} // Só mostra bolinha no hover para ficar limpo
                                            fill={isHovered ? "#18181b" : "transparent"}
                                            stroke={isHovered ? "#3b82f6" : "transparent"}
                                            strokeWidth="2"
                                            className="transition-all duration-200 pointer-events-none"
                                        />
                                    </g>
                                );
                            })}
                        </>
                    )}
                </svg>

                {/* TOOLTIP FLUTUANTE */}
                {hoveredIndex !== null && data[hoveredIndex] && safeWidth > 0 && (
                    <div
                        className="absolute bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl z-20 pointer-events-none transition-all duration-75 ease-out"
                        style={{
                            left: getX(hoveredIndex),
                            top: getY(data[hoveredIndex].value) - 15,
                            transform: 'translate(-50%, -100%) translateY(-10px)'
                        }}
                    >
                        <p className="text-zinc-400 text-[10px] uppercase font-bold mb-1 whitespace-nowrap">
                            {toHour(data[hoveredIndex].time)}
                        </p>
                        <span className="text-blue-400 text-sm font-bold block">
                            {/* Exibe o valor completo ou formatado */}
                            Val: {data[hoveredIndex].value.toFixed(6)}
                        </span>
                        
                        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-zinc-800 border-r border-b border-zinc-700 rotate-45"></div>
                    </div>
                )}
            </div>
        </div>
    );
}