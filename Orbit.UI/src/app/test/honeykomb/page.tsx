"use client";

import { useState, useMemo, useEffect } from "react";
import { FiSearch, FiServer, FiActivity, FiCpu } from "react-icons/fi";

// --- TIPAGEM ---
type NodeStatus = "healthy" | "warning" | "error" | "draining";

interface HiveNode {
    id: string;
    name: string;
    region: string;
    status: NodeStatus;
    cpu: number;
    mem: number;
}

// --- CONFIGURAÇÕES GEOMÉTRICAS ---
const HEX_SIZE = 18; // Raio do hexágono
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;
// Espaçamento entre eles
const GAP = 4; 
const X_STEP = HEX_WIDTH + GAP;
const Y_STEP = (HEX_HEIGHT * 0.75) + GAP;

// --- DADOS FAKES (Grande Escala) ---
const generateHiveData = (count: number): HiveNode[] => {
    return Array.from({ length: count }).map((_, i) => {
        const chance = Math.random();
        let status: NodeStatus = "healthy";
        if (chance > 0.95) status = "error";
        else if (chance > 0.9) status = "warning";
        else if (chance > 0.85) status = "draining";

        return {
            id: `node-${i}`,
            name: `worker-${String(i).padStart(3, '0')}`,
            region: i < count / 2 ? "us-east-1" : "eu-west-2",
            status,
            cpu: Math.floor(Math.random() * 90) + 10,
            mem: Math.floor(Math.random() * 80) + 20,
        };
    });
};

export default function ClusterHoneycombView() {
    // Simulamos 120 nós
    const allNodes = useMemo(() => generateHiveData(120), []);
    const [filter, setFilter] = useState("");
    const [hoveredNode, setHoveredNode] = useState<{ node: HiveNode, x: number, y: number } | null>(null);

    // --- FILTRAGEM ---
    const filteredNodes = useMemo(() => {
        if (!filter) return allNodes;
        return allNodes.map(n => ({
            ...n,
            // Se não der match, marcamos como 'dimmed' visualmente, mas mantemos no array
            // para não quebrar o layout do grid
            isDimmed: !n.name.includes(filter) && !n.status.includes(filter)
        }));
    }, [allNodes, filter]);

    // --- MATEMÁTICA DO GRID ---
    // Calcula quantas colunas cabem no container (estimado)
    const cols = 14; 

    const layoutNodes = useMemo(() => {
        return filteredNodes.map((node, i) => {
            // Cálculo de linha e coluna
            const row = Math.floor(i / cols);
            const col = i % cols;

            // Offset: Linhas ímpares são deslocadas para a direita pela metade da largura
            const xOffset = (row % 2 === 1) ? X_STEP / 2 : 0;
            
            const x = (col * X_STEP) + xOffset + 30; // +30 padding
            const y = (row * Y_STEP) + 40; // +40 padding

            return { ...node, x, y };
        });
    }, [filteredNodes]);

    // Calcula altura total necessária
    const totalHeight = (Math.ceil(filteredNodes.length / cols) * Y_STEP) + 80;


    // --- HELPERS VISUAIS ---
    const getHexColor = (status: NodeStatus) => {
        switch (status) {
            case "healthy": return "#10b981"; // Emerald
            case "warning": return "#f59e0b"; // Amber
            case "error": return "#ef4444"; // Red
            case "draining": return "#52525b"; // Zinc (Cinza)
        }
    };

    // Gera o path do hexágono
    const createHexPath = (r: number) => {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angleDeg = 60 * i - 30; // -30 para ponta ficar pra cima
            const angleRad = (Math.PI / 180) * angleDeg;
            points.push(`${r * Math.cos(angleRad)},${r * Math.sin(angleRad)}`);
        }
        return points.join(" ");
    };
    
    const hexPathString = useMemo(() => createHexPath(HEX_SIZE), []);

    return (
        <div className="w-full min-h-screen bg-zinc-950 flex flex-col items-center p-8 font-sans">
            
            <div className="w-full max-w-5xl bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
                
                {/* Header com Busca */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 backdrop-blur z-10">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                            <FiServer className="text-indigo-500" /> Cluster Hive
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">Visão de densidade de 120 nós</p>
                    </div>
                    
                    {/* Barra de Busca */}
                    <div className="relative group">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400" />
                        <input 
                            type="text" 
                            placeholder="Filtrar por nome ou status..." 
                            className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 transition-all"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                {/* Área do Grid */}
                <div className="w-full overflow-y-auto overflow-x-hidden relative bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]" style={{ height: '600px' }}>
                    
                    <svg width="100%" height={totalHeight} className="absolute top-0 left-0">
                        {layoutNodes.map((node) => {
                            const color = getHexColor(node.status);
                            const isDimmed = (node as any).isDimmed; // Vindo do filtro
                            const isHovered = hoveredNode?.node.id === node.id;

                            return (
                                <g 
                                    key={node.id} 
                                    transform={`translate(${node.x}, ${node.y})`}
                                    onMouseEnter={() => setHoveredNode({ node, x: node.x, y: node.y })}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    className="cursor-pointer transition-opacity duration-300"
                                    style={{ opacity: isDimmed ? 0.1 : 1 }}
                                >
                                    {/* Hexágono Principal */}
                                    <polygon
                                        points={hexPathString}
                                        fill={isHovered ? color : '#18181b'} // Preenchimento ao passar o mouse
                                        stroke={color}
                                        strokeWidth={isHovered ? 3 : 1.5}
                                        className="transition-all duration-150"
                                    />

                                    {/* Conteúdo interno do Hex (Opcional, só se for grande o suficiente) */}
                                    {/* Ponto central indicando status */}
                                    {!isHovered && (
                                        <circle r="3" fill={color} opacity="0.8">
                                            {node.status === 'healthy' && (
                                                <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + Math.random()}s`} repeatCount="indefinite" />
                                            )}
                                        </circle>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Tooltip (Renderizado como HTML sobre o SVG para facilitar estilização) */}
                    {hoveredNode && (
                        <div 
                            className="absolute bg-zinc-900/95 backdrop-blur border border-zinc-700 p-4 rounded-lg shadow-2xl z-20 pointer-events-none w-56 transform -translate-x-1/2 -translate-y-full"
                            style={{ 
                                left: hoveredNode.x, 
                                top: hoveredNode.y - 25, // Acima do hexágono
                            }}
                        >
                            <div className="flex justify-between items-start mb-3 border-b border-zinc-800 pb-2">
                                <div>
                                    <h3 className="font-bold text-zinc-100 text-sm">{hoveredNode.node.name}</h3>
                                    <p className="text-[10px] text-zinc-500 uppercase">{hoveredNode.node.region}</p>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getHexColor(hoveredNode.node.status)} text-black`} style={{ backgroundColor: getHexColor(hoveredNode.node.status) }}>
                                    {hoveredNode.node.status}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Barra CPU */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-zinc-400">
                                        <span className="flex items-center gap-1"><FiCpu /> CPU</span>
                                        <span>{hoveredNode.node.cpu}%</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${hoveredNode.node.cpu}%` }}></div>
                                    </div>
                                </div>
                                {/* Barra Memória */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-zinc-400">
                                        <span className="flex items-center gap-1"><FiActivity /> MEM</span>
                                        <span>{hoveredNode.node.mem}%</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500" style={{ width: `${hoveredNode.node.mem}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Setinha do Tooltip */}
                            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-zinc-900 border-r border-b border-zinc-700 rotate-45"></div>
                        </div>
                    )}

                </div>

                {/* Footer / Legenda */}
                <div className="bg-zinc-900 border-t border-zinc-800 p-3 flex justify-center gap-6 text-xs text-zinc-500 uppercase font-bold tracking-wider">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Saudável</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-f59e0b rounded-sm border border-amber-500 bg-amber-500"></div> Alerta</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Erro</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-zinc-600 rounded-sm"></div> Manutenção</div>
                </div>

            </div>
        </div>
    );
}