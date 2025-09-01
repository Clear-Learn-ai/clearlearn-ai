'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

function PipeElement({ position, rotation, scale, color }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Cylinder
        ref={meshRef}
        args={[0.1, 0.1, 2, 8]}
      >
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </Cylinder>
    </group>
  );
}

function JointElement({ position, color }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
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

function ElbowJoint({ position, rotation }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Torus
      ref={meshRef}
      position={position}
      rotation={rotation}
      args={[0.2, 0.08, 8, 16]}
    >
      <meshStandardMaterial
        color="#ff6b35"
        metalness={0.8}
        roughness={0.3}
        emissive="#ff6b35"
        emissiveIntensity={0.15}
      />
    </Torus>
  );
}

export function PipeSystemBackground() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        color="#ff6b35"
      />
      <pointLight
        position={[-10, -10, -5]}
        intensity={0.5}
        color="#0ea5e9"
      />
      
      <group ref={groupRef}>
        <PipeElement
          position={[-3, 1, -2]}
          rotation={[0, 0, Math.PI / 4]}
          scale={1.2}
          color="#ff6b35"
        />
        
        <PipeElement
          position={[2, -1, -3]}
          rotation={[Math.PI / 3, 0, 0]}
          scale={1}
          color="#0ea5e9"
        />
        
        <PipeElement
          position={[0, 2, -1]}
          rotation={[0, Math.PI / 4, Math.PI / 6]}
          scale={0.8}
          color="#f59e0b"
        />
        
        <PipeElement
          position={[-1.5, -2, -4]}
          rotation={[Math.PI / 2, 0, Math.PI / 3]}
          scale={1.5}
          color="#ef4444"
        />
        
        <JointElement
          position={[-2, 0, -2]}
          color="#ff6b35"
        />
        
        <JointElement
          position={[1, 1, -2]}
          color="#0ea5e9"
        />
        
        <JointElement
          position={[0, -1, -3]}
          color="#f59e0b"
        />
        
        <ElbowJoint
          position={[2.5, 1.5, -2]}
          rotation={[Math.PI / 4, 0, 0]}
        />
        
        <ElbowJoint
          position={[-2.5, -1.5, -3]}
          rotation={[0, Math.PI / 3, Math.PI / 2]}
        />
        
        <PipeElement
          position={[3.5, 0, -5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={1.3}
          color="#8b5cf6"
        />
        
        <PipeElement
          position={[-3.5, 1.5, -6]}
          rotation={[Math.PI / 6, 0, Math.PI / 4]}
          scale={0.9}
          color="#06d6a0"
        />
      </group>
    </>
  );
}