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

// --- DADOS FAKES (Fluxo de Custo Mensal) ---
// Nós (Os blocos verticais)
const rawNodes = [
    // Coluna 0: Origem
    { id: "n-aws", label: "AWS Infra", col: 0, color: "#f97316" }, // Orange
    { id: "n-gcp", label: "Google Cloud AI", col: 0, color: "#ea4335" }, // Red
    // Coluna 1: Serviços Orbit
    { id: "n-k8s", label: "K8s Cluster", col: 1, color: "#3b82f6" }, // Blue
    { id: "n-db", label: "Managed DB", col: 1, color: "#8b5cf6" }, // Purple
    { id: "n-storage", label: "Object Storage", col: 1, color: "#10b981" }, // Emerald
    // Coluna 2: Atribuição (Times)
    { id: "n-teamA", label: "Time App", col: 2, color: "#06b6d4" }, // Cyan
    { id: "n-teamB", label: "Time Data", col: 2, color: "#f472b6" }, // Pink
];

// Links (Os fluxos conectando os nós)
// value = valor monetário ou volume de dados
const rawLinks = [
    // AWS -> Serviços
    { source: "n-aws", target: "n-k8s", value: 4500 },
    { source: "n-aws", target: "n-db", value: 2500 },
    // GCP -> Serviços
    { source: "n-gcp", target: "n-k8s", value: 1500 },
    { source: "n-gcp", target: "n-storage", value: 1000 },
    // Serviços -> Times
    { source: "n-k8s", target: "n-teamA", value: 4000 },
    { source: "n-k8s", target: "n-teamB", value: 2000 },
    { source: "n-db", target: "n-teamA", value: 1500 },
    { source: "n-db", target: "n-teamB", value: 1000 },
    { source: "n-storage", target: "n-teamB", value: 1000 },
];

export default function CostFlowSankey() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerDimensions(containerRef);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    
    // --- CONFIGURAÇÕES GEOMÉTRICAS ---
    const nodeWidth = 120; // Largura dos blocos
    const nodePadding = 20; // Espaço vertical entre blocos
    const padding = { top: 40, right: 20, bottom: 20, left: 20 };
    const safeWidth = width || 800;
    const safeHeight = height || 500;
    const chartH = safeHeight - padding.top - padding.bottom;
    const chartW = safeWidth - padding.left - padding.right;

    // --- PROCESSAMENTO MATEMÁTICO PESADO (O motor do Sankey) ---
    const { nodes, links, columns } = useMemo(() => {
        if (safeHeight === 0) return { nodes: [], links: [], columns: [] };

        const nodeMap = new Map();
        // Calcula o valor total de cada nó (soma dos links que entram/saem)
        rawNodes.forEach(n => nodeMap.set(n.id, { ...n, value: 0, inputs: [], outputs: [] }));
        
        rawLinks.forEach(link => {
            nodeMap.get(link.source).value += link.value;
            nodeMap.get(link.target).value += link.value;
            nodeMap.get(link.source).outputs.push(link);
            nodeMap.get(link.target).inputs.push(link);
        });

        // Agrupa por coluna
        const cols: any[][] = [[], [], []];
        nodeMap.forEach(n => cols[n.col].push(n));

        // Calcula posições Y e Alturas
        // Encontra a coluna com o maior valor total para definir a escala
        const maxColValue = Math.max(...cols.map(col => col.reduce((sum, n) => sum + n.value, 0)));
        // Fator de escala: quantos pixels por unidade de valor
        const scaleFactor = (chartH - (nodePadding * (Math.max(...cols.map(c=>c.length)) - 1))) / maxColValue;

        cols.forEach((col, colIndex) => {
            let currentY = padding.top;
            // Centraliza verticalmente a coluna se ela for menor que a altura total
            const colTotalHeight = col.reduce((sum, n) => sum + (n.value * scaleFactor), 0) + (nodePadding * (col.length - 1));
            currentY += (chartH - colTotalHeight) / 2;

            col.forEach(node => {
                node.h = node.value * scaleFactor;
                node.y = currentY;
                // Posição X baseada na coluna
                node.x = padding.left + (colIndex * (chartW / (cols.length - 1))) - (colIndex === cols.length -1 ? nodeWidth : colIndex === 0 ? 0 : nodeWidth/2);
                
                currentY += node.h + nodePadding;

                // Calcula offsets para os links (onde cada fita começa/termina dentro do nó)
                let inputOffset = 0;
                node.inputs.forEach((link: any) => {
                    link.targetY = node.y + inputOffset + (link.value * scaleFactor / 2);
                    link.thickness = link.value * scaleFactor;
                    inputOffset += link.thickness;
                });
                let outputOffset = 0;
                node.outputs.forEach((link: any) => {
                    link.sourceY = node.y + outputOffset + (link.value * scaleFactor / 2);
                    link.thickness = link.value * scaleFactor;
                    outputOffset += link.thickness;
                });
            });
        });

        return { 
            nodes: Array.from(nodeMap.values()), 
            links: rawLinks.map(l => ({...l, sourceNode: nodeMap.get(l.source), targetNode: nodeMap.get(l.target)})),
            columns: cols 
        };
    }, [safeWidth, safeHeight, rawNodes, rawLinks]);


    return (
        <div className="w-full min-h-screen bg-zinc-950 flex justify-center items-center p-8 font-sans">
            <div className="w-full max-w-5xl bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl overflow-hidden relative">
                
                <div className="mb-2">
                    <h2 className="text-lg font-bold text-zinc-100">Fluxo de Custos Cloud</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Rastreamento de Origem e Atribuição (Mês Atual)</p>
                </div>

                {/* Rótulos das Colunas */}
                <div className="flex justify-between px-6 mb-4 text-xs font-bold text-zinc-500 uppercase tracking-widest relative z-10 pointer-events-none">
                    <span>Origem (Provedor)</span>
                    <span>Serviço Orbit</span>
                    <span>Atribuição (Time)</span>
                </div>

                <div ref={containerRef} className="w-full h-[500px] relative select-none">
                    {safeWidth > 0 && nodes.length > 0 && (
                        <svg width={safeWidth} height={safeHeight} className="absolute top-0 left-0 overflow-visible">
                            <defs>
                                {/* Gradientes para os Fluxos (Dá o efeito de "energia fluindo") */}
                                {links.map((link, i) => (
                                    <linearGradient key={`grad-${i}`} id={`grad-${link.source}-${link.target}`} gradientUnits="userSpaceOnUse" x1={link.sourceNode.x} y1="0" x2={link.targetNode.x} y2="0">
                                        <stop offset="0%" stopColor={link.sourceNode.color} stopOpacity="0.4" />
                                        <stop offset="100%" stopColor={link.targetNode.color} stopOpacity="0.4" />
                                    </linearGradient>
                                ))}
                            </defs>

                            {/* --- LINKS (As fitas de fluxo) --- */}
                            {links.map((link, i) => {
                                // Lógica de Hover: Se um nó está focado, destaca apenas os links conectados a ele
                                const isDimmed = hoveredNode && hoveredNode !== link.source && hoveredNode !== link.target;
                                const isHighlighted = hoveredNode === link.source || hoveredNode === link.target;
                                
                                // MATEMÁTICA DA CURVA DE BÉZIER CÚBICA
                                // M = Move to (Início)
                                // C = Cubic Bezier (Ponto de Controle 1, Ponto de Controle 2, Destino)
                                // Os pontos de controle criam a curvatura suave no meio do caminho.
                                const path = `
                                    M ${link.sourceNode.x + nodeWidth} ${link.sourceY}
                                    C ${link.sourceNode.x + nodeWidth + 100} ${link.sourceY},
                                      ${link.targetNode.x - 100} ${link.targetY},
                                      ${link.targetNode.x} ${link.targetY}
                                `;

                                return (
                                    <g key={i} className="transition-opacity duration-300" style={{ opacity: isDimmed ? 0.1 : 1 }}>
                                        {/* A linha do fluxo */}
                                        <path
                                            d={path}
                                            fill="none"
                                            // Usa o gradiente definido acima
                                            stroke={`url(#grad-${link.source}-${link.target})`}
                                            strokeWidth={link.thickness}
                                            strokeLinecap="round"
                                            className="transition-all duration-300"
                                            style={{ filter: isHighlighted ? `drop-shadow(0 0 8px ${link.sourceNode.color}50)` : 'none' }}
                                        />
                                        {/* Texto de valor no meio do fluxo (opcional, pode poluir) */}
                                        {/* <text x={(link.sourceNode.x + nodeWidth + link.targetNode.x)/2} y={(link.sourceY + link.targetY)/2} fill="white" fontSize="10" textAnchor="middle">${link.value}</text> */}
                                    </g>
                                );
                            })}

                            {/* --- NÓS (Os blocos verticais) --- */}
                            {nodes.map((node) => {
                                const isHovered = hoveredNode === node.id;
                                const isDimmed = hoveredNode && !isHovered && !node.inputs.some((l:any) => l.source === hoveredNode) && !node.outputs.some((l:any) => l.target === hoveredNode);

                                return (
                                    <g 
                                        key={node.id} 
                                        transform={`translate(${node.x}, ${node.y})`}
                                        onMouseEnter={() => setHoveredNode(node.id)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                        className="cursor-pointer transition-all duration-300"
                                        style={{ opacity: isDimmed ? 0.3 : 1 }}
                                    >
                                        {/* Bloco Colorido */}
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
                                        {/* Barra lateral sólida para destaque */}
                                        <rect width="4" height={node.h} rx="1" fill={node.color} />
                                        
                                        {/* Rótulos dentro do bloco */}
                                        <foreignObject width={nodeWidth} height={node.h} x="0" y="0">
                                            <div className="w-full h-full flex flex-col justify-center px-3 py-2 leading-tight">
                                                <p className="text-xs font-bold text-zinc-100 truncate">{node.label}</p>
                                                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                                                    {/* Formatação de moeda */}
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