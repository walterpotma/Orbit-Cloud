"use client";

import { useState, useRef, useEffect, useMemo } from "react";

// --- HOOK DE REDIMENSIONAMENTO (Padrão já estabelecido) ---
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

// Dados de Exemplo: Status dos Pods Kubernetes
const rawData = [
    { label: "Running", value: 45, color: "#10b981" }, // Emerald (Verde)
    { label: "Pending", value: 12, color: "#f59e0b" }, // Amber (Amarelo/Laranja)
    { label: "Failed", value: 5, color: "#ef4444" },   // Red (Vermelho)
    { label: "Unknown", value: 2, color: "#71717a" }   // Zinc (Cinza)
];

export default function DonutChart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerDimensions(containerRef as React.RefObject<HTMLDivElement>);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // --- CONFIGURAÇÕES DE GEOMETRIA ---
    // Espessura do anel da rosca
    const strokeWidth = 40; 
    // Espessura extra ao passar o mouse
    const hoverEffectThickness = 6;

    // --- CÁLCULOS MATEMÁTICOS (Memoizados para performance) ---
    const processedData = useMemo(() => {
        const total = rawData.reduce((acc, curr) => acc + curr.value, 0);
        
        let cumulativePercent = 0;
        
        return rawData.map((item, index) => {
            const percent = item.value / total;
            
            // O "pulo do gato" do SVG:
            // stroke-dashoffset define onde o traço começa. Nós giramos ele baseados
            // na soma das porcentagens anteriores.
            // O "-0.25" é porque o SVG começa a desenhar na direita (3 horas), 
            // e nós queremos começar no topo (12 horas), então voltamos 1/4 de volta.
            const startPercent = cumulativePercent - 0.25;
            
            cumulativePercent += percent;

            return {
                ...item,
                percent,
                startPercent,
                // Formata a porcentagem para exibir (ex: "45.2%")
                formattedPercent: (percent * 100).toFixed(1) + "%"
            };
        });
    }, []);

    const totalValue = rawData.reduce((acc, curr) => acc + curr.value, 0);

    // Dimensões seguras
    const safeWidth = width || 200; // Fallback para não quebrar matemática
    const safeHeight = height || 200;

    // Centro do gráfico
    const centerX = safeWidth / 2;
    const centerY = safeHeight / 2;

    // Raio: O menor lado dividido por 2, menos uma margem para não cortar a borda grossa
    const radius = (Math.min(safeWidth, safeHeight) / 2) - (strokeWidth / 2) - hoverEffectThickness;
    
    // Circunferência total (C = 2 * PI * r)
    const circumference = 2 * Math.PI * radius;


    // Lógica do Conteúdo Central (Dinâmico)
    // Se tiver hover, mostra o item. Se não, mostra o Total.
    const activeItem = hoveredIndex !== null ? processedData[hoveredIndex] : null;
    const centerLabel = activeItem ? activeItem.label : "Total Pods";
    const centerValue = activeItem ? activeItem.value : totalValue;
    const centerSubValue = activeItem ? activeItem.formattedPercent : "";
    const centerColor = activeItem ? activeItem.color : "#e4e4e7"; // Zinc-200 para total

    return (
        <div className="w-full min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-8 font-sans">
            
            <div className="w-full max-w-md bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl overflow-hidden flex flex-col items-center">
                
                <div className="mb-6 w-full text-left">
                    <h2 className="text-lg font-bold text-zinc-100">Status do Cluster</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Distribuição de Pods</p>
                </div>

                {/* Container do Gráfico */}
                {/* aspect-square garante que ele sempre tente ser um quadrado */}
                <div ref={containerRef} className="w-full aspect-square relative select-none max-h-[300px]">
                    
                    {safeWidth > 0 && (
                        <svg 
                            width={safeWidth} 
                            height={safeHeight} 
                            className="absolute top-0 left-0 overflow-visible transform -rotate-90" // Gira tudo para começar do topo
                        >
                           {/* Círculo de fundo (cinza escuro) para dar a forma da rosca vazia */}
                           <circle
                                cx={centerX}
                                cy={centerY}
                                r={radius}
                                fill="transparent"
                                stroke="#18181b" // Zinc-900 mais escuro
                                strokeWidth={strokeWidth}
                           />

                           {/* As fatias da rosca */}
                           {processedData.map((item, index) => {
                                const isHovered = hoveredIndex === index;
                                // O tamanho do traço visível
                                const dashLength = circumference * item.percent;
                                // O espaço vazio restante
                                const gapLength = circumference - dashLength;
                                // Onde o traço começa (rotacionado)
                                // O offset no SVG funciona ao contrário (negativo gira horário)
                                const offset = circumference * (1 - item.startPercent);
                                
                                return (
                                    <circle
                                        key={item.label}
                                        cx={centerX}
                                        cy={centerY}
                                        r={radius}
                                        fill="transparent"
                                        stroke={item.color}
                                        // Aumenta a espessura no hover
                                        strokeWidth={isHovered ? strokeWidth + hoverEffectThickness : strokeWidth}
                                        // Define o padrão de traço/espaço
                                        strokeDasharray={`${dashLength} ${gapLength}`}
                                        // Rotaciona o início do traço
                                        strokeDashoffset={offset}
                                        // Arredonda as pontas do traço para visual moderno
                                        strokeLinecap="round"
                                        className="transition-all duration-300 ease-out cursor-pointer"
                                        style={{ 
                                            // Diminui a opacidade dos outros itens quando um está em foco
                                            opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
                                            // Traz o item focado para frente (z-index no SVG)
                                            zIndex: isHovered ? 10 : 1
                                         }}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    />
                                )
                           })}
                        </svg>
                    )}

                    {/* --- CONTEÚDO CENTRAL (HTML Absoluto no meio da rosca) --- */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none transition-all duration-200">
                         <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-1">
                            {centerLabel}
                         </p>
                         <div className="flex items-baseline gap-1" style={{ color: centerColor }}>
                            <span className="text-4xl font-black tracking-tight transition-colors duration-200">
                                {centerValue}
                            </span>
                         </div>
                         {centerSubValue && (
                             <span className="text-sm font-bold text-zinc-400 mt-1">
                                 {centerSubValue}
                             </span>
                         )}
                    </div>

                </div>

                {/* --- LEGENDA (Abaixo do gráfico) --- */}
                <div className="w-full grid grid-cols-2 gap-4 mt-8">
                    {processedData.map((item, index) => (
                        <div 
                            key={item.label} 
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 cursor-pointer
                                ${hoveredIndex === index ? "bg-zinc-800/50" : "hover:bg-zinc-800/30"}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-200">{item.label}</span>
                                <span className="text-xs text-zinc-500">{item.value} pods ({item.formattedPercent})</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}