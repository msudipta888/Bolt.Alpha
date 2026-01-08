import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingSphereProps {
  position: [number, number, number];
  color: string;
  speed?: number;
  distort?: number;
  scale?: number;
  emissive?: boolean;
}

const FloatingSphere = ({ 
  position, 
  color, 
  speed = 1, 
  distort = 0.3, 
  scale = 1,
  emissive = false 
}: FloatingSphereProps) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    mesh.current.position.y = position[1] + Math.sin(t) * 0.2;
    mesh.current.rotation.x = Math.sin(t / 4) / 2;
    mesh.current.rotation.y = Math.sin(t / 2) / 2;
    
    // Add subtle pulse effect when hovered
    if (hovered) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 8) * 0.05 + 1;
      mesh.current.scale.set(scale * pulse, scale * pulse, scale * pulse);
    }
  });
  
  return (
    <Sphere 
      ref={mesh} 
      position={position} 
      args={[1, 64, 64]} 
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={hovered ? distort * 1.5 : distort}
        speed={hovered ? 0.6 : 0.4}
        roughness={0.1}
        metalness={0.6}
        clearcoat={1}
        clearcoatRoughness={0.3}
        envMapIntensity={1.5}
        emissive={emissive ? color : "#000000"}
        emissiveIntensity={emissive ? 0.4 : 0}
      />
    </Sphere>
  );
};

const BackgroundParticles = () => {
  const particlesCount = 150;
  const particlePositions = useRef<Float32Array | null>(null);
  const particles = useRef<THREE.Points>(null!);
  
  useEffect(() => {
    if (!particlePositions.current) {
      particlePositions.current = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        particlePositions.current[i3] = (Math.random() - 0.5) * 10;
        particlePositions.current[i3 + 1] = (Math.random() - 0.5) * 10;
        particlePositions.current[i3 + 2] = (Math.random() - 0.5) * 10;
      }
    }
  }, []);

  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        {particlePositions.current && (
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions.current, 3]}
          />
        )}
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#ffffff" 
        transparent 
        opacity={0.4} 
        sizeAttenuation 
      />
    </points>
  );
};

const EnvironmentController = () => {
  const { gl } = useThree();
  
  useEffect(() => {
    gl.setClearColor(new THREE.Color('#050816'), 1);
  }, [gl]);
  
  return null;
};

export const Scene = () => {
  const [rotationEnabled, setRotationEnabled] = useState(true);
  
  return (
    <div className="relative h-screen w-full -z-50">
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <EnvironmentController />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate={true} 
            autoRotateSpeed={0.5} 
          />
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
          <pointLight position={[-5, 5, 5]} intensity={1} color="#8b5cf6" />
          <pointLight position={[5, -5, 5]} intensity={1} color="#0ea5e9" />
          
          <FloatingSphere position={[-2, 0, 0]} color="#9775fa" speed={0.8} scale={0.8} emissive />
          <FloatingSphere position={[1.5, 1, -2]} color="#0ea5e9" speed={1.2} scale={1.2} />
          <FloatingSphere position={[1, -1, -1]} color="#d946ef" speed={0.6} scale={0.6} emissive />
          <FloatingSphere position={[-1.5, -1.5, -3]} color="#14b8a6" speed={1} scale={1} />
          <FloatingSphere position={[2.5, 0, -4]} color="#f97316" speed={0.7} scale={0.9} emissive />
          
          <BackgroundParticles />
          <Environment preset="city" />
        </Canvas>
      </div>
      
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-40 text-white px-4 py-2 rounded-lg">
        {/* <button 
          className="hover:text-blue-300 transition-colors"
          onClick={() => setRotationEnabled(!rotationEnabled)}
        >
          {rotationEnabled ? "Pause Rotation" : "Resume Rotation"}
        </button> */}
      </div>
    </div>
  );
};