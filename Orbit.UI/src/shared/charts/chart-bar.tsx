"use client";

import { useState, useRef, useEffect, useMemo } from "react";

// --- TIPAGEM DOS DADOS ---
interface MemoryMetric {
  time: string;
  value: number; // Em bytes
}

interface BarChartProps {
  title: string;
  subtitle: string;
  data: MemoryMetric[];
  maxValue: number;
}

// --- HOOK DE REDIMENSIONAMENTO ---
const useContainerDimensions = (myRef: React.RefObject<HTMLDivElement | null>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!myRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(myRef.current);
    return () => resizeObserver.disconnect();
  }, [myRef]);

  return dimensions;
};

// --- FUNÇÕES AUXILIARES ---

// Formata Bytes para MB ou GB
const formatMemory = (bytes: number) => {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1000) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(0)} MB`;
};

// Extrai HH:mm da string ISO
const toHour = (datetime: string) => {
  try {
    return datetime.split('T')[1].substring(0, 5);
  } catch {
    return "";
  }
};

export default function MemoryBarChart({ title, subtitle, data = [], maxValue }: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerDimensions(containerRef);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // --- CONFIGURAÇÕES DE LAYOUT ---
  const padding = { top: 30, right: 20, bottom: 40, left: 60 }; // Left maior para caber "1200 MB"
  const safeWidth = width || 0;
  const safeHeight = height || 0;
  const chartWidth = safeWidth - (padding.left + padding.right);
  const chartHeight = safeHeight - (padding.top + padding.bottom);

  // --- CÁLCULOS DINÂMICOS ---

  // 1. Acha o valor máximo para definir o teto do gráfico (+10% de respiro)
//   const maxValue = useMemo(() => {
//     if (data.length === 0) return 1;
//     const max = Math.max(...data.map((d) => d.value));
//     return max * 1.1; 
//   }, [data]);

  // 2. Gera 5 linhas de grade dinamicamente
  const gridTicks = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map(p => p * maxValue);
  }, [maxValue]);

  const gapRatio = 0.4; 
  const barStep = data.length > 0 ? chartWidth / data.length : 0;
  const barWidth = Math.max(barStep * (1 - gapRatio), 2); // Garante largura mínima de 2px
  const barGap = barStep * gapRatio;

  const getX = (index: number) => {
    if (chartWidth <= 0) return 0;
    return padding.left + (index * barStep) + (barGap / 2);
  };

  const getBarHeight = (value: number) => {
    if (chartHeight <= 0) return 0;
    return (value / maxValue) * chartHeight;
  };

  const getY = (value: number) => {
    return (safeHeight - padding.bottom) - getBarHeight(value);
  };

  return (
    <div className="w-full bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl overflow-hidden">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>Uso de RAM</span>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-[300px] relative select-none">
        {data.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
             Sem dados nas últimas 24h
           </div>
        )}

        <svg
          width={safeWidth}
          height={safeHeight}
          className="absolute top-0 left-0 overflow-visible"
        >
          {safeWidth > 0 && data.length > 0 && (
            <>
              {/* --- GRID HORIZONTAL --- */}
              {gridTicks.map((tick, i) => {
                const y = (safeHeight - padding.bottom) - ((tick / maxValue) * chartHeight);
                return (
                  <g key={i}>
                    <line
                      x1={padding.left} y1={y}
                      x2={safeWidth - padding.right} y2={y}
                      stroke="#27272a" strokeWidth="1" strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 10} y={y + 4}
                      fill="#71717a" fontSize="10" textAnchor="end"
                    >
                      {formatMemory(tick)}
                    </text>
                  </g>
                );
              })}

              {/* --- BARRAS --- */}
              {data.map((item, index) => {
                const x = getX(index);
                const y = getY(item.value);
                const height = getBarHeight(item.value);
                const isHovered = hoveredIndex === index;
                const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

                // Mostra hora no eixo X apenas para alguns pontos para não poluir
                // (Primeiro, Último e a cada 4 barras)
                const showLabel = index === 0 || index === data.length - 1 || index % 4 === 0;

                return (
                  <g key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="transition-opacity duration-200 cursor-pointer"
                    style={{ opacity: isDimmed ? 0.4 : 1 }}
                  >
                    {/* Barra */}
                    <rect
                      x={x} y={y}
                      width={barWidth} height={height}
                      rx="2" ry="2"
                      fill={isHovered ? "#34d399" : "#10b981"} // Emerald
                      className="transition-all duration-200 ease-out"
                    />

                    {/* Rótulo Eixo X (Hora) */}
                    {showLabel && (
                        <text
                        x={x + (barWidth / 2)}
                        y={safeHeight - 15}
                        fill={isHovered ? "#e4e4e7" : "#71717a"}
                        fontSize="10"
                        textAnchor="middle"
                        className="transition-colors duration-200"
                        >
                        {toHour(item.time)}
                        </text>
                    )}
                    
                    {/* Área transparente para facilitar o hover em barras finas */}
                    <rect
                        x={x - (barGap/2)}
                        y={padding.top}
                        width={barStep}
                        height={chartHeight}
                        fill="transparent"
                    />
                  </g>
                );
              })}
            </>
          )}
        </svg>

        {/* --- TOOLTIP FLUTUANTE --- */}
        {hoveredIndex !== null && data[hoveredIndex] && safeWidth > 0 && (
          <div
            className="absolute bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl z-20 pointer-events-none transition-all duration-75 ease-out"
            style={{
              left: getX(hoveredIndex) + (barWidth / 2),
              top: getY(data[hoveredIndex].value) - 10,
              transform: 'translate(-50%, -100%) translateY(-5px)'
            }}
          >
            <p className="text-zinc-400 text-[10px] uppercase font-bold mb-1 whitespace-nowrap">
              {toHour(data[hoveredIndex].time)}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-400 text-lg font-bold whitespace-nowrap">
                {formatMemory(data[hoveredIndex].value)}
              </span>
            </div>
            {/* Seta do Tooltip */}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-zinc-800 border-r border-b border-zinc-700 rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
}