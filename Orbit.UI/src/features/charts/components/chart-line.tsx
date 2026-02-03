"use client";

import { useState, useRef, useEffect } from "react";

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

// Dados
const data = [
    { "hora": "10:00", "cpu": 15 },
    { "hora": "10:05", "cpu": 45 },
    { "hora": "10:10", "cpu": 30 },
    { "hora": "10:15", "cpu": 85 },
    { "hora": "10:20", "cpu": 60 },
    { "hora": "10:25", "cpu": 75 }
];

export default function ProfessionalChartPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerDimensions(containerRef as React.RefObject<HTMLDivElement>);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const maxY = 100;
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };

    const safeWidth = width || 0;
    const safeHeight = height || 0;

    const chartWidth = safeWidth - (padding.left + padding.right);
    const chartHeight = safeHeight - (padding.top + padding.bottom);

    const getX = (index: number) => {
        if (chartWidth <= 0) return 0;
        return (index / (data.length - 1)) * chartWidth + padding.left;
    };

    const getY = (valorCpu: number) => {
        if (chartHeight <= 0) return 0;
        const percentage = valorCpu / maxY;
        return padding.top + (chartHeight - (chartHeight * percentage));
    };

    const linePoints = data.map((p, i) => `${getX(i)},${getY(p.cpu)}`).join(" ");
    const areaPoints = `
        ${padding.left},${safeHeight - padding.bottom} 
        ${linePoints} 
        ${safeWidth - padding.right},${safeHeight - padding.bottom}
    `;

    const gridTicks = [0, 25, 50, 75, 100];

    return (
        <div className="w-full bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl overflow-hidden">

            <div className="mb-4">
                <h2 className="text-lg font-bold text-zinc-100">Uso de CPU</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Últimos 30 minutos</p>
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

                    {/* Só desenha o conteúdo se tivermos largura real para evitar glitches visuais */}
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
                            {hoveredIndex !== null && (
                                <line
                                    x1={getX(hoveredIndex)} y1={padding.top}
                                    x2={getX(hoveredIndex)} y2={safeHeight - padding.bottom}
                                    stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4"
                                    className="opacity-50"
                                />
                            )}

                            {data.map((ponto, index) => {
                                const x = getX(index);
                                const y = getY(ponto.cpu);
                                const isHovered = hoveredIndex === index;

                                return (
                                    <g key={index}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        <text
                                            x={x} y={safeHeight - 10}
                                            fill="#71717a" fontSize="10" textAnchor="middle"
                                        >
                                            {ponto.hora}
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
                {hoveredIndex !== null && safeWidth > 0 && (
                    <div
                        className="absolute bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl z-20 pointer-events-none transition-all duration-75 ease-out"
                        style={{
                            left: getX(hoveredIndex),
                            top: getY(data[hoveredIndex].cpu) - 10,
                            transform: 'translate(-50%, -100%) translateY(-10px)'
                        }}
                    >
                        <p className="text-zinc-400 text-[10px] uppercase font-bold mb-1 whitespace-nowrap">
                            {data[hoveredIndex].hora}
                        </p>
                        <span className="text-blue-400 text-xl font-bold">
                            {data[hoveredIndex].cpu}%
                        </span>
                        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-zinc-800 border-r border-b border-zinc-700 rotate-45"></div>
                    </div>
                )}
            </div>
        </div>
    );
}