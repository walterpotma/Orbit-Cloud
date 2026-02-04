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

// --- DADOS FAKES (Tráfego de Rede) ---
const generateNetworkData = () => {
    const data = [];
    let rx = 50; // Recebido (Download)
    let tx = 30; // Transmitido (Upload)
    
    // Gera 60 pontos (último minuto, por exemplo)
    for (let i = 0; i < 60; i++) {
        // Simula flutuação natural
        rx = Math.max(10, rx + (Math.random() * 40 - 20)); 
        tx = Math.max(5, tx + (Math.random() * 30 - 15));
        
        // Simula picos ocasionais
        if (Math.random() > 0.9) rx += 100;
        if (Math.random() > 0.9) tx += 80;

        data.push({
            time: `${i}s`,
            rx: Math.floor(rx), // Mbps
            tx: Math.floor(tx)  // Mbps
        });
    }
    return data;
};

export default function NetworkTrafficChart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerDimensions(containerRef as React.RefObject<HTMLDivElement>);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Gera dados uma vez
    const data = useMemo(() => generateNetworkData(), []);

    // --- CONFIGURAÇÕES ---
    const padding = { top: 20, right: 0, bottom: 20, left: 0 };
    
    // --- CÁLCULOS MATEMÁTICOS ---
    const safeWidth = width || 0;
    const safeHeight = height || 0;
    
    // O Zero é no meio da altura
    const centerY = safeHeight / 2;
    
    // Altura máxima disponível para cada lado (cima ou baixo)
    const availableHalfHeight = (safeHeight / 2) - padding.top;

    // Acha o valor máximo absoluto (seja RX ou TX) para definir a escala
    const maxVal = Math.max(
        ...data.map(d => d.rx),
        ...data.map(d => d.tx)
    ) * 1.2; // +20% de margem

    // Função X: Distribui no tempo
    const getX = (index: number) => {
        if (safeWidth === 0) return 0;
        return (index / (data.length - 1)) * safeWidth;
    };

    // Função Y Download (Para Cima - Subtrai do CenterY)
    const getY_RX = (val: number) => {
        if (safeHeight === 0) return 0;
        const percent = val / maxVal;
        return centerY - (percent * availableHalfHeight);
    };

    // Função Y Upload (Para Baixo - Soma ao CenterY)
    const getY_TX = (val: number) => {
        if (safeHeight === 0) return 0;
        const percent = val / maxVal;
        return centerY + (percent * availableHalfHeight);
    };

    // --- CRIAÇÃO DOS CAMINHOS SVG (PATH) ---
    // Precisamos fechar o polígono: Começa no meio, vai desenhando a linha, volta pro meio.
    
    const rxPath = useMemo(() => {
        if (safeWidth === 0) return "";
        const points = data.map((d, i) => `${getX(i)},${getY_RX(d.rx)}`).join(" ");
        // Fecha o shape: Ponto final no centro -> Ponto inicial no centro
        return `${points} ${safeWidth},${centerY} 0,${centerY}`;
    }, [data, safeWidth, safeHeight, maxVal]);

    const txPath = useMemo(() => {
        if (safeWidth === 0) return "";
        const points = data.map((d, i) => `${getX(i)},${getY_TX(d.tx)}`).join(" ");
        return `${points} ${safeWidth},${centerY} 0,${centerY}`;
    }, [data, safeWidth, safeHeight, maxVal]);


    return (
        <div className="w-full bg-zinc-950 flex justify-center items-center font-sans">
            
            <div className="w-full bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl overflow-hidden relative">
                
                {/* Cabeçalho com Legenda */}
                <div className="flex justify-between items-start mb-4 z-10 relative pointer-events-none">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-100">Rede I/O</h2>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Interface eth0</p>
                    </div>
                    <div className="flex gap-4 text-xs font-bold uppercase">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                            <span className="text-cyan-400">Download</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.5)]"></div>
                            <span className="text-fuchsia-500">Upload</span>
                        </div>
                    </div>
                </div>

                <div 
                    ref={containerRef} 
                    className="w-full h-[350px] relative cursor-crosshair"
                    // Detecta o mouse no container inteiro para calcular o índice
                    onMouseMove={(e) => {
                        if (!containerRef.current) return;
                        const rect = containerRef.current.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        // Regra de 3 inversa: Pixel X -> Índice do Array
                        const index = Math.round((x / rect.width) * (data.length - 1));
                        // Garante limites
                        const safeIndex = Math.max(0, Math.min(index, data.length - 1));
                        setHoveredIndex(safeIndex);
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    
                    {safeWidth > 0 && (
                        <svg width={safeWidth} height={safeHeight} className="absolute top-0 left-0 overflow-visible pointer-events-none">
                            
                            <defs>
                                {/* Gradiente Ciano (Download) - Vai do forte para o transparente no centro */}
                                <linearGradient id="gradRx" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.05" />
                                </linearGradient>
                                
                                {/* Gradiente Roxo (Upload) - Transparente no centro, forte embaixo */}
                                <linearGradient id="gradTx" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#d946ef" stopOpacity="0.05" />
                                    <stop offset="100%" stopColor="#d946ef" stopOpacity="0.5" />
                                </linearGradient>
                            </defs>

                            {/* --- LINHA CENTRAL (O Zero) --- */}
                            <line 
                                x1="0" y1={centerY} 
                                x2={safeWidth} y2={centerY} 
                                stroke="#3f3f46" 
                                strokeWidth="1" 
                                strokeDasharray="5 5"
                            />

                            {/* --- ÁREA DE DOWNLOAD (Parte de Cima) --- */}
                            <polygon points={rxPath} fill="url(#gradRx)" />
                            {/* Linha da borda superior */}
                            <polyline 
                                points={data.map((d, i) => `${getX(i)},${getY_RX(d.rx)}`).join(" ")}
                                fill="none"
                                stroke="#22d3ee"
                                strokeWidth="2"
                            />

                            {/* --- ÁREA DE UPLOAD (Parte de Baixo) --- */}
                            <polygon points={txPath} fill="url(#gradTx)" />
                            {/* Linha da borda inferior */}
                            <polyline 
                                points={data.map((d, i) => `${getX(i)},${getY_TX(d.tx)}`).join(" ")}
                                fill="none"
                                stroke="#d946ef"
                                strokeWidth="2"
                            />

                            {/* --- INTERATIVIDADE --- */}
                            {hoveredIndex !== null && (
                                <g>
                                    {/* Linha Vertical Guia */}
                                    <line 
                                        x1={getX(hoveredIndex)} y1={0}
                                        x2={getX(hoveredIndex)} y2={safeHeight}
                                        stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2"
                                    />
                                    
                                    {/* Ponto Download */}
                                    <circle 
                                        cx={getX(hoveredIndex)} cy={getY_RX(data[hoveredIndex].rx)} 
                                        r="4" fill="#22d3ee" stroke="white" strokeWidth="2"
                                    />
                                    
                                    {/* Ponto Upload */}
                                    <circle 
                                        cx={getX(hoveredIndex)} cy={getY_TX(data[hoveredIndex].tx)} 
                                        r="4" fill="#d946ef" stroke="white" strokeWidth="2"
                                    />
                                </g>
                            )}

                        </svg>
                    )}

                    {/* --- TOOLTIP DUPLO --- */}
                    {hoveredIndex !== null && safeWidth > 0 && (
                        <div 
                            className="absolute bg-zinc-800/90 backdrop-blur-md border border-zinc-700 p-3 rounded-lg shadow-xl z-20 pointer-events-none transition-all duration-75 flex gap-6"
                            style={{ 
                                left: getX(hoveredIndex), 
                                top: centerY, // Tooltip sempre no meio vertical
                                transform: `translate(${getX(hoveredIndex) > safeWidth / 2 ? '-105%' : '5%'}, -50%)` // Inteligência: se passar do meio, joga pra esquerda
                            }}
                        >
                            {/* Bloco Download */}
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                                    <span className="text-cyan-400 text-xs">↓</span> RX
                                </span>
                                <span className="text-xl font-mono font-bold text-cyan-50">
                                    {data[hoveredIndex].rx} <span className="text-xs font-sans text-zinc-500">Mbps</span>
                                </span>
                            </div>

                            {/* Divisor */}
                            <div className="w-px bg-zinc-700"></div>

                            {/* Bloco Upload */}
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                                    <span className="text-fuchsia-400 text-xs">↑</span> TX
                                </span>
                                <span className="text-xl font-mono font-bold text-fuchsia-50">
                                    {data[hoveredIndex].tx} <span className="text-xs font-sans text-zinc-500">Mbps</span>
                                </span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}