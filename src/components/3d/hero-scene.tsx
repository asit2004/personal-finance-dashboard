"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { FloatingOrb } from "./floating-orb";
import { useMousePosition } from "@/hooks/use-mouse-position";
import * as THREE from "three";

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useMousePosition();

  // Smooth lerp toward mouse position every frame — correct use of useFrame
  useFrame(() => {
    if (!groupRef.current) return;
    const { normalizedX, normalizedY } = mouseRef.current;
    const targetX = normalizedX * 0.15;
    const targetY = normalizedY * 0.1;
    groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x += (targetY - groupRef.current.rotation.x) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#818cf8" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#22d3ee" />

      <FloatingOrb position={[-2.5, 0.5, -1]} color="#6366f1" size={0.5} speed={0.8} floatIntensity={1.2} />
      <FloatingOrb position={[2.2, -0.3, -2]} color="#22d3ee" size={0.35} speed={1.1} floatIntensity={0.9} />
      <FloatingOrb position={[0.5, 1.2, -1.5]} color="#a78bfa" size={0.25} speed={0.9} floatIntensity={1.5} />
      <FloatingOrb position={[-1.5, -1, -0.5]} color="#f472b6" size={0.2} speed={1.3} floatIntensity={0.7} />
    </group>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 opacity-60">
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
