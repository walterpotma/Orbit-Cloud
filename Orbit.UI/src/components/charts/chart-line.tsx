"use client";

import { useState, useRef, useEffect } from "react";

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

// Dados corrigidos (Exemplo de entrada)
// Se os dados vierem via props, remova esta constante
const defaultData = [
    { "time": "2026-02-05T10:00:00", "value": 15 },
    { "time": "2026-02-05T10:05:00", "value": 45 },
    { "time": "2026-02-05T10:10:00", "value": 30 },
    { "time": "2026-02-05T10:15:00", "value": 85 },
    { "time": "2026-02-05T10:20:00", "value": 60 },
    { "time": "2026-02-05T10:25:00", "value": 75 }
];

type ChartProps = {
    tittle: string;
    subtittle: string;
    width?: number;
    height?: number;
    data?: { time: string; value: number }[]; // Tipagem melhorada
};

export default function ProfessionalChartPage({ tittle, subtittle, data = defaultData }: ChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerDimensions(containerRef);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const maxY = 100;
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };

    const safeWidth = width || 0;
    const safeHeight = height || 0;

    const chartWidth = safeWidth - (padding.left + padding.right);
    const chartHeight = safeHeight - (padding.top + padding.bottom);

    // Função de Formatação de Hora Corrigida
    const toHour = (datetime: string) => {
        try {
            // Abordagem simples (string split) para evitar problemas de fuso horário no Next.js
            if (datetime.includes('T')) {
                 return datetime.split('T')[1].slice(0, 5);
            }
            // Fallback se não tiver T (ex: apenas "10:00")
            return datetime.slice(0, 5);
        } catch (e) {
            return datetime;
        }
    };

    const getX = (index: number) => {
        if (chartWidth <= 0) return 0;
        return (index / (data.length - 1)) * chartWidth + padding.left;
    };

    const getY = (valor: number) => {
        if (chartHeight <= 0) return 0;
        const percentage = valor / maxY;
        return padding.top + (chartHeight - (chartHeight * percentage));
    };

    // Gera os pontos da linha SVG
    // Note: corrigido de p.cpu para p.value
    const linePoints = data.map((p, i) => `${getX(i)},${getY(p.value)}`).join(" ");
    
    const areaPoints = `
        ${padding.left},${safeHeight - padding.bottom} 
        ${linePoints} 
        ${safeWidth - padding.right},${safeHeight - padding.bottom}
    `;

    const gridTicks = [0, 25, 50, 75, 100];

    return (
        <div className="w-full bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl overflow-hidden">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-zinc-100">{tittle}</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{subtittle}</p>
            </div>

            <div ref={containerRef} className="w-full h-[300px] relative select-none">
                <svg
                    width={safeWidth}
                    height={safeHeight}
                    className="absolute top-0 left-0 overflow-visible"
                >
                    <defs>
                        <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {safeWidth > 0 && (
                        <>
                            {/* EIXO Y */}
                            {gridTicks.map((tick) => {
                                const y = getY(tick);
                                return (
                                    <g key={tick}>
                                        <line
                                            x1={padding.left} y1={y}
                                            x2={safeWidth - padding.right} y2={y}
                                            stroke="#27272a" strokeWidth="1"
                                        />
                                        <text
                                            x={padding.left - 10} y={y + 4}
                                            fill="#71717a" fontSize="10" textAnchor="end"
                                        >
                                            {tick}%
                                        </text>
                                    </g>
                                );
                            })}

                            {/* GRÁFICO */}
                            <polygon points={areaPoints} fill="url(#cpuGradient)" />
                            <polyline
                                points={linePoints}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* INTERATIVIDADE */}
                            {hoveredIndex !== null && data[hoveredIndex] && (
                                <line
                                    x1={getX(hoveredIndex)} y1={padding.top}
                                    x2={getX(hoveredIndex)} y2={safeHeight - padding.bottom}
                                    stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4"
                                    className="opacity-50"
                                />
                            )}

                            {data.map((ponto, index) => {
                                const x = getX(index);
                                const y = getY(ponto.value); // Corrigido de .cpu para .value
                                const isHovered = hoveredIndex === index;

                                return (
                                    <g key={index}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {/* Texto do Eixo X (Hora) */}
                                        <text
                                            x={x} y={safeHeight - 10}
                                            fill="#71717a" fontSize="10" textAnchor="middle"
                                        >
                                            {toHour(ponto.time)}
                                        </text>

                                        {/* Área de clique aumentada */}
                                        <circle cx={x} cy={y} r="15" fill="transparent" className="cursor-pointer" />

                                        {/* Ponto Visual */}
                                        <circle
                                            cx={x} cy={y}
                                            r={isHovered ? 6 : 4}
                                            fill={isHovered ? "#18181b" : "#3b82f6"}
                                            stroke="#3b82f6" strokeWidth="2"
                                            className="transition-all duration-200"
                                        />
                                    </g>
                                );
                            })}
                        </>
                    )}
                </svg>

                {/* TOOLTIP */}
                {hoveredIndex !== null && data[hoveredIndex] && safeWidth > 0 && (
                    <div
                        className="absolute bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl z-20 pointer-events-none transition-all duration-75 ease-out"
                        style={{
                            left: getX(hoveredIndex),
                            top: getY(data[hoveredIndex].value) - 10,
                            transform: 'translate(-50%, -100%) translateY(-10px)'
                        }}
                    >
                        <p className="text-zinc-400 text-[10px] uppercase font-bold mb-1 whitespace-nowrap">
                            {toHour(data[hoveredIndex].time)}
                        </p>
                        <span className="text-blue-400 text-xl font-bold">
                            {data[hoveredIndex].value.toFixed(2)}%
                        </span>
                        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-zinc-800 border-r border-b border-zinc-700 rotate-45"></div>
                    </div>
                )}
            </div>
        </div>
    );
}