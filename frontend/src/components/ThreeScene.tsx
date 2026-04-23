"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Book({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t + position[0]) * 0.2;
    ref.current.rotation.x = Math.cos(t + position[1]) * 0.08;
  });

  return (
    <Float floatIntensity={1} rotationIntensity={0.8}>
      <mesh ref={ref} position={position} castShadow>
        <boxGeometry args={[1.6, 2.2, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
      </mesh>
    </Float>
  );
}

function Pencil({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.z = Math.sin(t + position[0]) * 0.6;
  });

  return (
    <Float floatIntensity={0.5} rotationIntensity={0.5}>
      <group position={position} ref={ref}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2.6, 16]} />
          <meshStandardMaterial color={color} metalness={0.1} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.12, 0.4, 12]} />
          <meshStandardMaterial color={"#d4a832"} />
        </mesh>
        <mesh position={[0, -1.3, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.16, 12]} />
          <meshStandardMaterial color={"#e6e6e6"} />
        </mesh>
      </group>
    </Float>
  );
}

export default function ThreeScene() {
  const bookColors = ["#0B3C5D", "#0D4A6B", "#14608A"];
  const pencilColors = ["#F2C94C", "#E5B73B", "#D4A832"];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.6} />
        <directionalLight position={[-10, -5, -10]} intensity={0.3} />
        <pointLight position={[0, 2, 2]} intensity={0.8} color={0xffd97f} />

        <Suspense fallback={null}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Book
              key={`b-${i}`}
              position={[((i % 4) - 1.5) * 2.2, (Math.floor(i / 4) - 0.5) * 1.6, (i % 2) * -1]}
              color={bookColors[i % bookColors.length]}
            />
          ))}

          {Array.from({ length: 6 }).map((_, i) => (
            <Pencil
              key={`p-${i}`}
              position={[((i % 3) - 1) * 2.6, (Math.floor(i / 3) - 0.5) * 1.2, -1.5 + (i % 2)]}
              color={pencilColors[i % pencilColors.length]}
            />
          ))}
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
