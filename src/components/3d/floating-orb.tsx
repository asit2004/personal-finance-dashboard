"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingOrbProps {
  position: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
  floatIntensity?: number;
}

export function FloatingOrb({
  position,
  color,
  size = 1,
  speed = 1,
  floatIntensity = 1,
}: FloatingOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;

    // Smooth floating motion
    meshRef.current.position.y =
      initialY + Math.sin(t * 0.5) * 0.3 * floatIntensity;
    meshRef.current.position.x =
      position[0] + Math.sin(t * 0.3) * 0.1 * floatIntensity;

    // Subtle rotation
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    meshRef.current.rotation.z = Math.cos(t * 0.15) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.6}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}
