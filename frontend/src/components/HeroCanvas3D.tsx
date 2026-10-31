import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Environment,
  Sparkles,
} from "@react-three/drei";
import type * as THREE from "three";

function AnimatedMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.12;
      meshRef.current.rotation.y = t * 0.18;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.08;
      torusRef.current.rotation.z = t * 0.14;
    }
  });

  return (
    <>
      {/* Main icosahedron — electric violet */}
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.2}>
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.6, 1]} />
          <MeshDistortMaterial
            color="#7c3aed"
            distort={0.35}
            speed={2}
            roughness={0}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
      </Float>

      {/* Orbiting torus — electric rose */}
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={0.6}>
        <mesh
          ref={torusRef}
          position={[2.4, -0.6, -0.8]}
          rotation={[0.4, 0.2, 0]}
        >
          <torusGeometry args={[0.8, 0.22, 16, 48]} />
          <MeshDistortMaterial
            color="#f43f5e"
            distort={0.2}
            speed={3}
            roughness={0.1}
            metalness={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      </Float>

      {/* Ambient particles */}
      <Sparkles
        count={70}
        scale={8}
        size={1.5}
        speed={0.3}
        opacity={0.5}
        color="#a78bfa"
      />
    </>
  );
}

export default function HeroCanvas3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#7c3aed" />
      <pointLight position={[-5, -5, 5]} intensity={1.5} color="#f43f5e" />
      <pointLight position={[0, 5, -5]} intensity={1} color="#10b981" />

      <Suspense fallback={null}>
        <AnimatedMesh />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
