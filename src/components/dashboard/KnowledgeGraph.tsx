"use client";
import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { supabase } from "@/lib/supabase";

// Colors per source_type — matches analytics page palette
const TYPE_COLORS: Record<string, string> = {
  youtube:    "#ef4444",
  github:     "#a855f7",
  web:        "#3b82f6",
  chef:       "#f97316",
  rss:        "#eab308",
  audio:      "#ec4899",
  docgrab:    "#06b6d4",
  notebooklm: "#10b981",
};
const DEFAULT_COLOR = "#10b981";

function nodeColor(type: string) {
  return TYPE_COLORS[type] ?? DEFAULT_COLOR;
}

interface GraphNode {
  id: string;
  position: [number, number, number];
  color: string;
  title: string;
  isHub: boolean;
}

interface GraphEdge {
  from: number;
  to: number;
}

function Node({ position, color, title, isHub, isSelected, onClick }: any) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (isSelected) {
      meshRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
    } else {
      const t = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(t, t, t), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {isHub
          ? <octahedronGeometry args={[0.22, 0]} />
          : <sphereGeometry args={[0.1, 12, 12]} />}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 6 : isHub ? 2 : 1}
        />
      </mesh>

      {(hovered || isSelected) && (
        <Html distanceFactor={10} position={[0, 0.35, 0]}>
          <div className="whitespace-nowrap bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg pointer-events-none select-none">
            {isHub ? (
              <div className="text-[10px] font-black uppercase tracking-tighter mb-0.5" style={{ color }}>
                {title}
              </div>
            ) : (
              <>
                <div className="text-[10px] font-black uppercase tracking-tighter text-gray-400 mb-0.5">
                  Knowledge Node
                </div>
                <div className="text-white text-xs font-bold max-w-[180px] truncate">{title}</div>
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function buildGraph(rows: any[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const types = [...new Set(rows.map((r) => r.source_type as string))];
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Hub nodes in a flat ring
  const hubRadius = 5;
  const hubMap: Record<string, number> = {};
  types.forEach((type, ti) => {
    const angle = (ti / types.length) * Math.PI * 2;
    hubMap[type] = nodes.length;
    nodes.push({
      id: `hub-${type}`,
      position: [Math.cos(angle) * hubRadius, 0, Math.sin(angle) * hubRadius],
      color: nodeColor(type),
      title: type.toUpperCase(),
      isHub: true,
    });
  });

  // Leaf nodes clustered around their hub
  rows.forEach((row) => {
    const hubIdx = hubMap[row.source_type];
    if (hubIdx === undefined) return;
    const hub = nodes[hubIdx];
    const spread = 2.8;
    const leafIdx = nodes.length;
    nodes.push({
      id: `leaf-${row.id}`,
      position: [
        hub.position[0] + (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        hub.position[2] + (Math.random() - 0.5) * spread,
      ],
      color: nodeColor(row.source_type),
      title: row.title || row.source_url || String(row.id),
      isHub: false,
    });
    edges.push({ from: leafIdx, to: hubIdx });
  });

  return { nodes, edges };
}

function buildMockGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const mockTypes = ["youtube", "web", "github", "rss", "audio"];
  const rows = mockTypes.flatMap((type, ti) =>
    Array.from({ length: 4 }, (_, i) => ({
      id: `mock-${ti}-${i}`,
      source_type: type,
      title: `Demo ${type} ${i + 1}`,
      source_url: "",
    }))
  );
  return buildGraph(rows);
}

function Graph() {
  const groupRef = useRef<THREE.Group>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [rows, setRows] = useState<any[] | null>(null);

  useEffect(() => {
    supabase
      .from("ingestions")
      .select("id, source_type, title, source_url")
      .eq("status", "success")
      .order("processed_at", { ascending: false })
      .limit(60)
      .then(({ data }) => setRows(data ?? []));
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (rows === null) return { nodes: [], edges: [] }; // loading
    if (rows.length === 0) return buildMockGraph();     // demo fallback
    return buildGraph(rows);
  }, [rows]);

  useFrame(() => {
    if (groupRef.current && selectedNode === null) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {edges.map((edge, i) => {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        if (!a || !b) return null;
        return (
          <Line
            key={i}
            points={[a.position, b.position]}
            color={a.color}
            lineWidth={0.4}
            transparent
            opacity={0.12}
          />
        );
      })}

      {nodes.map((node) => (
        <Node
          key={node.id}
          {...node}
          isSelected={selectedNode === node.id}
          onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
        />
      ))}
    </group>
  );
}

export default function KnowledgeGraph() {
  return (
    <div className="w-full h-full min-h-[500px] cursor-crosshair">
      <Canvas camera={{ position: [0, 8, 18], fov: 40 }}>
        <color attach="background" args={["#0e1117"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Graph />
        <OrbitControls
          enableZoom={true}
          autoRotate={false}
          enablePan={false}
          maxDistance={30}
          minDistance={5}
        />
      </Canvas>
    </div>
  );
}
