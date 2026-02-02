"use client";

import { useState, useRef, useEffect } from "react";

// --- HOOK DE REDIMENSIONAMENTO (O mesmo que já usamos) ---
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

// Dados de Exemplo (Consumo de Memória por Serviço)
const data = [
    { "label": "Frontend", "value": 450 },
    { "label": "API Core", "value": 820 },
    { "label": "Database", "value": 600 },
    { "label": "Worker", "value": 300 },
    { "label": "Redis", "value": 150 },
    { "label": "Auth", "value": 200 }
];

export default function BarChart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerDimensions(containerRef as React.RefObject<HTMLDivElement>);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // --- CONFIGURAÇÕES ---
    // Calcula o valor máximo automaticamente (com uma margem de 10% pra não bater no teto)
    const maxValue = Math.max(...data.map(d => d.value)) * 1.1; 
    
    const padding = { top: 30, right: 20, bottom: 40, left: 40 };

    // Dimensões úteis
    const safeWidth = width || 0;
    const safeHeight = height || 0;
    const chartWidth = safeWidth - (padding.left + padding.right);
    const chartHeight = safeHeight - (padding.top + padding.bottom);

    // --- CÁLCULOS DE GEOMETRIA ---
    
    // Calcula a largura de cada barra e o espaço entre elas
    // gapRatio = 0.3 significa que 30% do espaço é vazio (gap)
    const gapRatio = 0.3; 
    const barStep = chartWidth / data.length; // Espaço total disponível por item
    const barWidth = barStep * (1 - gapRatio); // Largura da barra sólida
    const barGap = barStep * gapRatio; // Largura do espaço vazio

    // Função para pegar a posição X (centro da barra)
    const getX = (index: number) => {
        if (chartWidth <= 0) return 0;
        // Padding + (passo * index) + (metade do gap para centralizar no slot)
        return padding.left + (index * barStep) + (barGap / 2);
    };

    // Função para pegar a altura da barra (baseada no valor)
    const getBarHeight = (value: number) => {
        if (chartHeight <= 0) return 0;
        return (value / maxValue) * chartHeight;
    };

    // Função para pegar a posição Y do topo da barra
    const getY = (value: number) => {
        return (safeHeight - padding.bottom) - getBarHeight(value);
    };

    const gridTicks = [0, 250, 500, 750, 1000]; // Pode ser calculado dinamicamente se quiser

    return (
        <div className="w-full min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-8 font-sans">
            
            <div className="w-full max-w-3xl bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl overflow-hidden">
                
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-100">Consumo de Memória (MB)</h2>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Por Serviço</p>
                    </div>
                    {/* Exemplo de Legenda */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>Ativos</span>
                    </div>
                </div>

                {/* Container do Gráfico */}
                <div ref={containerRef} className="w-full h-[300px] relative select-none">
                    
                    <svg 
                        width={safeWidth} 
                        height={safeHeight} 
                        className="absolute top-0 left-0 overflow-visible"
                    >
                        {safeWidth > 0 && (
                            <>
                                {/* --- GRID HORIZONTAL --- */}
                                {gridTicks.map((tick) => {
                                    // Normaliza o tick para a escala do gráfico
                                    const y = (safeHeight - padding.bottom) - ((tick / maxValue) * chartHeight);
                                    return (
                                        <g key={tick}>
                                            <line 
                                                x1={padding.left} y1={y} 
                                                x2={safeWidth - padding.right} y2={y} 
                                                stroke="#27272a" strokeWidth="1" strokeDasharray="4 4"
                                            />
                                            <text 
                                                x={padding.left - 10} y={y + 4} 
                                                fill="#71717a" fontSize="10" textAnchor="end"
                                            >
                                                {tick}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* --- BARRAS --- */}
                                {data.map((item, index) => {
                                    const x = getX(index);
                                    const y = getY(item.value);
                                    const height = getBarHeight(item.value);
                                    
                                    // Lógica de "Foco": Se estou passando o mouse em alguém,
                                    // e não é este aqui, diminui a opacidade dele.
                                    const isDimmed = hoveredIndex !== null && hoveredIndex !== index;
                                    const isHovered = hoveredIndex === index;

                                    return (
                                        <g key={index}
                                           onMouseEnter={() => setHoveredIndex(index)}
                                           onMouseLeave={() => setHoveredIndex(null)}
                                           className="transition-opacity duration-200 cursor-pointer"
                                           style={{ opacity: isDimmed ? 0.3 : 1 }}
                                        >
                                            {/* A Barra em si */}
                                            <rect
                                                x={x}
                                                y={y}
                                                width={barWidth}
                                                height={height}
                                                // Arredonda apenas os cantos de cima
                                                rx="4" ry="4" 
                                                fill={isHovered ? "#34d399" : "#10b981"} // Emerald-500 / 400
                                                className="transition-all duration-200 ease-out"
                                            />

                                            {/* Rótulo X (Nome do serviço) */}
                                            <text
                                                x={x + (barWidth / 2)}
                                                y={safeHeight - 15}
                                                fill={isHovered ? "#e4e4e7" : "#71717a"} // Highlight texto no hover
                                                fontSize="10"
                                                textAnchor="middle"
                                                className="transition-colors duration-200 uppercase font-medium tracking-wide"
                                            >
                                                {item.label}
                                            </text>
                                        </g>
                                    );
                                })}
                            </>
                        )}
                    </svg>

                    {/* --- TOOLTIP FLUTUANTE (Dessa vez verde/emerald para diferenciar) --- */}
                    {hoveredIndex !== null && safeWidth > 0 && (
                        <div 
                            className="absolute bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl z-20 pointer-events-none transition-all duration-75 ease-out"
                            style={{ 
                                left: getX(hoveredIndex) + (barWidth / 2), 
                                top: getY(data[hoveredIndex].value) - 10,
                                transform: 'translate(-50%, -100%) translateY(-5px)'
                            }}
                        >
                            <p className="text-zinc-400 text-[10px] uppercase font-bold mb-1 whitespace-nowrap">
                                {data[hoveredIndex].label}
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-emerald-400 text-xl font-bold">
                                    {data[hoveredIndex].value} <span className="text-xs text-zinc-500 font-normal">MB</span>
                                </span>
                            </div>
                            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-zinc-800 border-r border-b border-zinc-700 rotate-45"></div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}