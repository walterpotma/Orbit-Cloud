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

// --- TIPAGEM ---
interface SankeyNode {
    id: string;
    label: string;
    col: number;
    color: string;
    value: number;
    x: number;
    y: number;
    h: number;
    inputs: any[];
    outputs: any[];
}

interface SankeyLink {
    source: string;
    target: string;
    value: number;
    sourceNode: SankeyNode;
    targetNode: SankeyNode;
    sourceY: number;
    targetY: number;
    thickness: number;
}

// --- DADOS FAKES ---
const rawNodes = [
    { id: "n-aws", label: "AWS Infra", col: 0, color: "#f97316" }, 
    { id: "n-gcp", label: "Google Cloud AI", col: 0, color: "#ea4335" }, 
    { id: "n-k8s", label: "K8s Cluster", col: 1, color: "#3b82f6" }, 
    { id: "n-db", label: "Managed DB", col: 1, color: "#8b5cf6" }, 
    { id: "n-storage", label: "Object Storage", col: 1, color: "#10b981" }, 
    { id: "n-teamA", label: "Time App", col: 2, color: "#06b6d4" }, 
    { id: "n-teamB", label: "Time Data", col: 2, color: "#f472b6" }, 
];

const rawLinks = [
    { source: "n-aws", target: "n-k8s", value: 4500 },
    { source: "n-aws", target: "n-db", value: 2500 },
    { source: "n-gcp", target: "n-k8s", value: 1500 },
    { source: "n-gcp", target: "n-storage", value: 1000 },
    { source: "n-k8s", target: "n-teamA", value: 4000 },
    { source: "n-k8s", target: "n-teamB", value: 2000 },
    { source: "n-db", target: "n-teamA", value: 1500 },
    { source: "n-db", target: "n-teamB", value: 1000 },
    { source: "n-storage", target: "n-teamB", value: 1000 },
];

export default function CostFlowSankey() {
    const containerRef = useRef<HTMLDivElement>(null);
    // CORREÇÃO 1: Type Casting no Ref
    const { width, height } = useContainerDimensions(containerRef as React.RefObject<HTMLDivElement>);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    
    // --- CONFIGURAÇÕES ---
    const nodeWidth = 120; 
    const nodePadding = 20; 
    const padding = { top: 40, right: 20, bottom: 20, left: 20 };
    const safeWidth = width || 800;
    const safeHeight = height || 500;
    const chartH = safeHeight - padding.top - padding.bottom;
    const chartW = safeWidth - padding.left - padding.right;

    // --- CÁLCULOS ---
    const { nodes, links } = useMemo(() => {
        if (safeHeight === 0) return { nodes: [], links: [], columns: [] };

        const nodeMap = new Map<string, SankeyNode>();
        
        // Inicializa nós
        rawNodes.forEach(n => nodeMap.set(n.id, { 
            ...n, 
            value: 0, 
            inputs: [], 
            outputs: [],
            x: 0, y: 0, h: 0 
        }));
        
        // Calcula valores e conexões
        rawLinks.forEach(link => {
            const src = nodeMap.get(link.source);
            const tgt = nodeMap.get(link.target);
            if (src && tgt) {
                src.value += link.value;
                tgt.value += link.value;
                // Vamos armazenar o objeto link original temporariamente
                src.outputs.push({ ...link });
                tgt.inputs.push({ ...link });
            }
        });

        const cols: SankeyNode[][] = [[], [], []];
        nodeMap.forEach(n => cols[n.col].push(n));

        const maxColValue = Math.max(...cols.map(col => col.reduce((sum, n) => sum + n.value, 0)));
        const scaleFactor = (chartH - (nodePadding * (Math.max(...cols.map(c=>c.length)) - 1))) / maxColValue;

        // Lista final de links enriquecidos
        const finalLinks: SankeyLink[] = [];

        cols.forEach((col, colIndex) => {
            let currentY = padding.top;
            const colTotalHeight = col.reduce((sum, n) => sum + (n.value * scaleFactor), 0) + (nodePadding * (col.length - 1));
            currentY += (chartH - colTotalHeight) / 2;

            col.forEach(node => {
                node.h = node.value * scaleFactor;
                node.y = currentY;
                node.x = padding.left + (colIndex * (chartW / (cols.length - 1))) - (colIndex === cols.length -1 ? nodeWidth : colIndex === 0 ? 0 : nodeWidth/2);
                
                currentY += node.h + nodePadding;

                // Calcula offsets para inputs
                let inputOffset = 0;
                // Precisamos processar os inputs do nó para saber onde chegam os links
                node.inputs.forEach((tempLink: any) => {
                     // Aqui apenas calculamos os offsets, o link final será construído quando processarmos o output do nó de origem ou em um passo separado
                     // Para simplificar, vamos reconstruir os links baseados nos nós já posicionados
                });
            });
        });

        // Agora que todos os nós têm X, Y e H, vamos calcular os links finais com coordenadas exatas
        // Precisamos iterar pelos nós novamente para definir sourceY e targetY corretamente
        // Uma forma mais segura é recalcular os offsets agora que temos a ordem
        
        // Reset offsets auxiliares
        const nodeOffsets = new Map<string, { in: number, out: number }>();
        nodeMap.forEach(n => nodeOffsets.set(n.id, { in: 0, out: 0 }));

        rawLinks.forEach(rawL => {
            const src = nodeMap.get(rawL.source)!;
            const tgt = nodeMap.get(rawL.target)!;
            const thickness = rawL.value * scaleFactor;
            
            const srcOff = nodeOffsets.get(src.id)!;
            const tgtOff = nodeOffsets.get(tgt.id)!;

            const link: SankeyLink = {
                source: rawL.source,
                target: rawL.target,
                value: rawL.value,
                sourceNode: src,
                targetNode: tgt,
                // CORREÇÃO 2: Propriedades agora existem na interface SankeyLink
                thickness: thickness,
                sourceY: src.y + srcOff.out + (thickness / 2),
                targetY: tgt.y + tgtOff.in + (thickness / 2)
            };

            srcOff.out += thickness;
            tgtOff.in += thickness;
            
            finalLinks.push(link);
        });

        return { 
            nodes: Array.from(nodeMap.values()), 
            links: finalLinks, 
            columns: cols 
        };
    }, [safeWidth, safeHeight, chartH, chartW]); // Removidos rawNodes/rawLinks das deps pois são estáticos


    return (
        <div className="w-full min-h-screen bg-zinc-950 flex justify-center items-center p-8 font-sans">
            <div className="w-full max-w-5xl bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl overflow-hidden relative">
                
                <div className="mb-2">
                    <h2 className="text-lg font-bold text-zinc-100">Fluxo de Custos Cloud</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Rastreamento de Origem e Atribuição (Mês Atual)</p>
                </div>

                <div className="flex justify-between px-6 mb-4 text-xs font-bold text-zinc-500 uppercase tracking-widest relative z-10 pointer-events-none">
                    <span>Origem (Provedor)</span>
                    <span>Serviço Orbit</span>
                    <span>Atribuição (Time)</span>
                </div>

                {/* CORREÇÃO 3: h-125 (500px) */}
                <div ref={containerRef} className="w-full h-125 relative select-none">
                    {safeWidth > 0 && nodes.length > 0 && (
                        <svg width={safeWidth} height={safeHeight} className="absolute top-0 left-0 overflow-visible">
                            <defs>
                                {links.map((link, i) => (
                                    <linearGradient key={`grad-${i}`} id={`grad-${link.source}-${link.target}`} gradientUnits="userSpaceOnUse" x1={link.sourceNode.x} y1="0" x2={link.targetNode.x} y2="0">
                                        <stop offset="0%" stopColor={link.sourceNode.color} stopOpacity="0.4" />
                                        <stop offset="100%" stopColor={link.targetNode.color} stopOpacity="0.4" />
                                    </linearGradient>
                                ))}
                            </defs>

                            {links.map((link, i) => {
                                const isDimmed = hoveredNode && hoveredNode !== link.source && hoveredNode !== link.target;
                                const isHighlighted = hoveredNode === link.source || hoveredNode === link.target;
                                
                                const path = `
                                    M ${link.sourceNode.x + nodeWidth} ${link.sourceY}
                                    C ${link.sourceNode.x + nodeWidth + 100} ${link.sourceY},
                                      ${link.targetNode.x - 100} ${link.targetY},
                                      ${link.targetNode.x} ${link.targetY}
                                `;

                                return (
                                    <g key={i} className="transition-opacity duration-300" style={{ opacity: isDimmed ? 0.1 : 1 }}>
                                        <path
                                            d={path}
                                            fill="none"
                                            stroke={`url(#grad-${link.source}-${link.target})`}
                                            strokeWidth={link.thickness}
                                            strokeLinecap="round"
                                            className="transition-all duration-300"
                                            style={{ filter: isHighlighted ? `drop-shadow(0 0 8px ${link.sourceNode.color}50)` : 'none' }}
                                        />
                                    </g>
                                );
                            })}

                            {nodes.map((node) => {
                                const isHovered = hoveredNode === node.id;
                                // Casting seguro para any aqui ou refatorar lógica de highlight
                                const isDimmed = hoveredNode && !isHovered && 
                                    !links.some(l => l.source === hoveredNode && l.target === node.id) && 
                                    !links.some(l => l.target === hoveredNode && l.source === node.id);

                                return (
                                    <g 
                                        key={node.id} 
                                        transform={`translate(${node.x}, ${node.y})`}
                                        onMouseEnter={() => setHoveredNode(node.id)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                        className="cursor-pointer transition-all duration-300"
                                        style={{ opacity: isDimmed ? 0.3 : 1 }}
                                    >
                                        <rect
                                            width={nodeWidth}
                                            height={node.h}
                                            rx="4"
                                            fill={node.color}
                                            fillOpacity="0.2"
                                            stroke={node.color}
                                            strokeWidth="1"
                                            className={`transition-all duration-300 ${isHovered ? 'stroke-2 shadow-lg' : ''}`}
                                            style={{ filter: isHovered ? `drop-shadow(0 0 12px ${node.color}70)` : 'none' }}
                                        />
                                        <rect width="4" height={node.h} rx="1" fill={node.color} />
                                        
                                        <foreignObject width={nodeWidth} height={node.h} x="0" y="0">
                                            <div className="w-full h-full flex flex-col justify-center px-3 py-2 leading-tight">
                                                <p className="text-xs font-bold text-zinc-100 truncate">{node.label}</p>
                                                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(node.value)}
                                                </p>
                                            </div>
                                        </foreignObject>
                                    </g>
                                );
                            })}
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}