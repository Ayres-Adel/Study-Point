import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, DragControls } from "@react-three/drei";
import * as THREE from "three";

function GraduationCap({ color, hovered }: { color: string; hovered: boolean }) {
  const group = useRef<THREE.Group>(null);
  const flashProgress = useRef(0);
  
  // Trigger a flash when hovered becomes true
  useEffect(() => {
    if (hovered) {
      flashProgress.current = 1.0;
    }
  }, [hovered]);

  // Random per-cap offset for animation
  const randomOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }, delta) => {
    if (group.current) {
      const t = clock.getElapsedTime();
      // Continuous Y-axis rotation tied to elapsed time + random offset
      group.current.rotation.y = t * 0.3 + randomOffset;
      // X-axis rotation oscillates with a sine wave (amplitude 0.15)
      group.current.rotation.x = Math.sin(t + randomOffset) * 0.15;

      // Flash animation: fade out gradually
      if (flashProgress.current > 0) {
        flashProgress.current -= delta * 1.5; // Fades out completely in ~0.66 seconds
        if (flashProgress.current < 0) flashProgress.current = 0;
      }
      
      // Max intensity 0.25 (a little bit)
      const currentIntensity = flashProgress.current * 0.25; 
      
      group.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat && mat.emissive) {
            mat.emissiveIntensity = currentIntensity;
          }
        }
      });
    }
  });

  const glowColor = "white";

  return (
    <Float speed={1} rotationIntensity={0.4} floatIntensity={0.5}>
      <group ref={group}>
        {/* Skull cap base: cylinder */}
        <mesh position={[0, -0.09, 0]}>
          <cylinderGeometry args={[0.28, 0.32, 0.18, 16]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} emissive={glowColor} emissiveIntensity={0} />
        </mesh>
        
        {/* Mortarboard (flat square top): box */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.85, 0.04, 0.85]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} emissive={glowColor} emissiveIntensity={0} />
        </mesh>

        {/* Button on top center: sphere */}
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#F2C94C" roughness={0.3} metalness={0.7} emissive={glowColor} emissiveIntensity={0} />
        </mesh>

        {/* Tassel string: thin cylinder */}
        <mesh position={[0.3, -0.15, 0.3]} rotation={[0, 0, Math.PI / 12]}>
          <cylinderGeometry args={[0.008, 0.008, 0.35, 8]} />
          <meshStandardMaterial color="#F2C94C" roughness={0.3} metalness={0.7} emissive={glowColor} emissiveIntensity={0} />
        </mesh>

        {/* Tassel end: cone */}
        <mesh position={[0.34, -0.35, 0.3]} rotation={[0, 0, Math.PI / 12]}>
          <coneGeometry args={[0.05, 0.15, 8]} />
          <meshStandardMaterial color="#F2C94C" roughness={0.6} metalness={0.3} emissive={glowColor} emissiveIntensity={0} />
        </mesh>
      </group>
    </Float>
  );
}

function DraggableCap({ position, rotation, scale, color }: { position: [number, number, number], rotation: [number, number, number], scale: number, color: string }) {
  const { viewport } = useThree();
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (dragging) {
      document.body.style.cursor = 'grabbing';
    } else if (hovered) {
      document.body.style.cursor = 'grab';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [hovered, dragging]);
  
  // Create drag limits so the cap cannot be dragged outside the visible hero area.
  // We use viewport width and height to clamp the coordinates.
  const w = viewport.width / 2;
  const h = viewport.height / 2;

  const dragLimits: [[number, number], [number, number], undefined] = [
    [-w * 2, w * 2],
    [-h * 2, h * 2],
    undefined
  ];

  return (
    <DragControls 
      dragLimits={dragLimits}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
    >
      <group 
        position={position} 
        rotation={rotation} 
        scale={scale}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          setHovered(false);
        }}
      >
        <GraduationCap color={color} hovered={hovered} />
      </group>
    </DragControls>
  );
}

function Scene() {
  const mouseGroup = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  // Calculate a responsive scale based on the viewport width (canvas size)
  // At camera z=7, fov=50, a typical desktop width is ~8-10 units. Mobile is ~3-4 units.
  const responsiveScale = Math.min(1, viewport.width / 8);

  useFrame((state) => {
    if (mouseGroup.current) {
      const targetY = state.pointer.x * 0.3;
      const targetX = -state.pointer.y * 0.1;
      
      mouseGroup.current.rotation.y = THREE.MathUtils.lerp(
        mouseGroup.current.rotation.y,
        targetY,
        0.05
      );
      mouseGroup.current.rotation.x = THREE.MathUtils.lerp(
        mouseGroup.current.rotation.x,
        targetX,
        0.05
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} color="#ffffff" />
      <directionalLight position={[-3, 3, 2]} intensity={0.3} color="#F2C94C" />
      <pointLight position={[0, 0, 3]} color="#F2C94C" intensity={0.5} distance={10} />

      <group ref={mouseGroup} scale={responsiveScale}>
        <DraggableCap position={[-3, 1.5, -2]} color="#0B3C5D" scale={1.0} rotation={[0, 0, 0.1]} />
        <DraggableCap position={[3, -1, -2.5]} color="#14608A" scale={1.1} rotation={[0, 0, -0.1]} />
        <DraggableCap position={[0, 2.2, -3]} color="#0D4A6B" scale={0.9} rotation={[0.1, 0, 0.2]} />
        <DraggableCap position={[-1.5, -2, -2]} color="#0B3C5D" scale={0.85} rotation={[-0.1, 0.1, -0.1]} />
        <DraggableCap position={[2.5, 1.8, -3.5]} color="#14608A" scale={0.7} rotation={[-0.2, 0.2, 0]} />
        <DraggableCap position={[-4, -0.5, -4]} color="#0D4A6B" scale={1.2} rotation={[0.1, -0.1, 0.2]} />
        <DraggableCap position={[1.5, -2.5, -1.5]} color="#0B3C5D" scale={0.95} rotation={[0, 0.3, -0.2]} />
      </group>

      <Sparkles
        count={80}
        scale={12}
        size={2}
        speed={0.2}
        color="#F2C94C"
        opacity={0.4}
      />
    </>
  );
}

export default function GraduationCapsBackground() {
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Attach R3F pointer events to the hero section so clicks pass through the DOM overlay
    setEventSource(document.getElementById('hero') || document.body);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: -1,
      overflow: 'hidden'
      // pointerEvents: 'none' removed so the canvas can receive events via eventSource
    }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        eventSource={eventSource || undefined}
        eventPrefix="client"
      >
        <Scene />
      </Canvas>
    </div>
  );
}
