"use client";
import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { supabase } from "@/lib/supabase";

function Node({ position, color, title, isSelected, onClick }: any) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Efecto de pulso si está seleccionado
      if (isSelected) {
        meshRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(hovered ? 1.3 : 1, hovered ? 1.3 : 1, hovered ? 1.3 : 1), 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 5 : 1}
        />
      </mesh>

      {(hovered || isSelected) && (
        <Html distanceFactor={10} position={[0, 0.3, 0]}>
          <div className="whitespace-nowrap bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg pointer-events-none select-none">
            <div className="text-[10px] font-black uppercase tracking-tighter text-[#10b981] mb-0.5">
              Knowledge Node
            </div>
            <div className="text-white text-xs font-bold">{title}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Graph() {
  const groupRef = useRef<THREE.Group>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [dbNodes, setDbNodes] = useState<any[]>([]);
  const [dbEdges, setDbEdges] = useState<any[]>([]);

  // Fetch inicial y Suscripción Realtime
  useEffect(() => {
    const fetchData = async () => {
      const { data: nodes } = await supabase.table("knowledge_nodes").select("*");
      const { data: edges } = await supabase.table("knowledge_edges").select("*");
      if (nodes) setDbNodes(nodes);
      if (edges) setDbEdges(edges);
    };

    fetchData();

    const channel = supabase
      .channel("knowledge_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "knowledge_nodes" }, (payload) => {
        fetchData(); // Recargar todo para simplificar la posición
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const { nodes, connections } = useMemo(() => {
    // Si no hay datos en DB, usar mock data para la demo
    if (dbNodes.length === 0) {
      const mockNodes = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        position: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10] as [number, number, number],
        color: "#10b981",
        title: `Demo Node ${i}`,
      }));
      return { nodes: mockNodes, connections: [] };
    }

    // Mapear nodos de DB a posiciones 3D
    const mappedNodes = dbNodes.map((n, i) => ({
      id: n.id,
      position: [n.pos_x || (Math.random() - 0.5) * 12, n.pos_y || (Math.random() - 0.5) * 12, n.pos_z || (Math.random() - 0.5) * 12] as [number, number, number],
      color: n.category === "youtube" ? "#ef4444" : "#10b981",
      title: n.title,
    }));

    const mappedEdges = dbEdges.map(e => {
      const start = mappedNodes.findIndex(n => n.id === e.source_id);
      const end = mappedNodes.findIndex(n => n.id === e.target_id);
      return (start !== -1 && end !== -1) ? [start, end] : null;
    }).filter(Boolean) as [number, number][];

    return { nodes: mappedNodes, connections: mappedEdges };
  }, [dbNodes, dbEdges]);

  useFrame((state) => {
    if (groupRef.current && selectedNode === null) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {connections.map(([start, end], i) => (
        <Line
          key={i}
          points={[nodes[start].position, nodes[end].position]}
          color="#10b981"
          lineWidth={0.5}
          transparent
          opacity={0.15}
        />
      ))}

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
      <Canvas camera={{ position: [0, 0, 18], fov: 40 }}>
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
