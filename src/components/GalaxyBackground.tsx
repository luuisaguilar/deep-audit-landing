"use client";
import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function Particles({ count = 2000 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const scrollRef = useRef(0);

  // Generar posiciones aleatorias para las partículas
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Velocidad base + reacción al scroll
    const scrollSpeed = scrollRef.current * 0.0005;
    pointsRef.current.rotation.y += delta * (0.05 + scrollSpeed);
    pointsRef.current.rotation.x += delta * (0.02 + scrollSpeed * 0.5);

    // Efecto de profundidad/zoom sutil con el scroll
    const targetZ = -scrollRef.current * 0.002;
    pointsRef.current.position.z = THREE.MathUtils.lerp(
      pointsRef.current.position.z,
      targetZ,
      0.1
    );
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#10b981"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export default function GalaxyBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#0e1117]">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Particles />
      </Canvas>
    </div>
  );
}
