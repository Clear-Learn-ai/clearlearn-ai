'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

interface PlumbingAssemblyProps {
  progress: number;
}

function AnimatedPipe({ 
  position, 
  rotation, 
  length, 
  delay, 
  progress, 
  color = "#ff6b35" 
}: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scale = useMemo(() => {
    const adjustedProgress = Math.max(0, (progress - delay) / (1 - delay));
    return Math.min(1, adjustedProgress * 2);
  }, [progress, delay]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.y = scale;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <Cylinder
      ref={meshRef}
      position={position}
      rotation={rotation}
      args={[0.1, 0.1, length, 8]}
    >
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </Cylinder>
  );
}

function AnimatedJoint({ position, delay, progress, color = "#0ea5e9" }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scale = useMemo(() => {
    const adjustedProgress = Math.max(0, (progress - delay) / (1 - delay));
    return Math.min(1, adjustedProgress * 3);
  }, [progress, delay]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <Sphere
      ref={meshRef}
      position={position}
      args={[0.15, 16, 16]}
    >
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.1}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </Sphere>
  );
}

function AnimatedTool({ position, delay, progress }: any) {
  const meshRef = useRef<THREE.Group>(null);
  const visible = progress > delay;

  useFrame((state) => {
    if (meshRef.current && visible) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  if (!visible) return null;

  return (
    <group ref={meshRef} position={position}>
      <Box args={[0.05, 0.8, 0.05]}>
        <meshStandardMaterial color="#8b5a3c" />
      </Box>
      <Box position={[0, 0.3, 0]} args={[0.2, 0.1, 0.05]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </Box>
    </group>
  );
}

function WaterFlow({ progress }: { progress: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      position: [
        Math.sin(i * 0.5) * 0.05,
        -1 + (i * 0.1),
        Math.cos(i * 0.5) * 0.05
      ],
      speed: 0.02 + Math.random() * 0.01
    }));
  }, []);

  useFrame(() => {
    particles.forEach((particle, i) => {
      if (progress > 0.8) {
        particle.position[1] += particle.speed;
        if (particle.position[1] > 2) {
          particle.position[1] = -1;
        }
      }
    });
  });

  if (progress < 0.8) return null;

  return (
    <group>
      {particles.map((particle) => (
        <Sphere
          key={particle.id}
          position={particle.position as [number, number, number]}
          args={[0.02, 8, 8]}
        >
          <meshStandardMaterial
            color="#0ea5e9"
            transparent
            opacity={0.6}
            emissive="#0ea5e9"
            emissiveIntensity={0.3}
          />
        </Sphere>
      ))}
    </group>
  );
}

export function PlumbingAssembly({ progress }: PlumbingAssemblyProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      <AnimatedPipe
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        length={2}
        delay={0}
        progress={progress}
        color="#ff6b35"
      />
      
      <AnimatedPipe
        position={[0.5, 1, 0]}
        rotation={[0, 0, Math.PI / 2]}
        length={1}
        delay={0.2}
        progress={progress}
        color="#0ea5e9"
      />
      
      <AnimatedPipe
        position={[-0.5, -1, 0]}
        rotation={[0, 0, Math.PI / 2]}
        length={1}
        delay={0.4}
        progress={progress}
        color="#f59e0b"
      />
      
      <AnimatedJoint
        position={[0, 1, 0]}
        delay={0.3}
        progress={progress}
        color="#ff6b35"
      />
      
      <AnimatedJoint
        position={[0, -1, 0]}
        delay={0.5}
        progress={progress}
        color="#0ea5e9"
      />
      
      <AnimatedJoint
        position={[1, 1, 0]}
        delay={0.6}
        progress={progress}
        color="#f59e0b"
      />
      
      <AnimatedTool
        position={[1.5, 0.5, 0]}
        delay={0.7}
        progress={progress}
      />
      
      <WaterFlow progress={progress} />
    </group>
  );
}