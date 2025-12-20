import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedGlobe = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Create connection points on the globe
  const { points, linePositions } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const linePos: number[] = [];
    const count = 100;

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      
      const x = 2.05 * Math.cos(theta) * Math.sin(phi);
      const y = 2.05 * Math.sin(theta) * Math.sin(phi);
      const z = 2.05 * Math.cos(phi);
      
      pts.push(new THREE.Vector3(x, y, z));
    }

    // Create some random connections
    for (let i = 0; i < 50; i++) {
      const idx1 = Math.floor(Math.random() * pts.length);
      const idx2 = Math.floor(Math.random() * pts.length);
      if (idx1 !== idx2) {
        linePos.push(
          pts[idx1].x, pts[idx1].y, pts[idx1].z,
          pts[idx2].x, pts[idx2].y, pts[idx2].z
        );
      }
    }

    return { points: pts, linePositions: linePos };
  }, []);

  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [points]);

  const linesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    return geometry;
  }, [linePositions]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Main globe */}
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshPhongMaterial
          color="#0a1628"
          transparent
          opacity={0.9}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[2.01, 32, 32]}>
        <meshBasicMaterial
          color="#00b8d4"
          transparent
          opacity={0.1}
          wireframe
        />
      </Sphere>

      {/* Connection points */}
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial
          color="#ff8c00"
          size={0.05}
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Connection lines */}
      <lineSegments ref={linesRef} geometry={linesGeometry}>
        <lineBasicMaterial
          color="#00b8d4"
          transparent
          opacity={0.2}
        />
      </lineSegments>

      {/* Outer glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.5, 64]} />
        <meshBasicMaterial
          color="#ff8c00"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner atmosphere */}
      <Sphere args={[2.2, 32, 32]}>
        <meshBasicMaterial
          color="#00b8d4"
          transparent
          opacity={0.05}
        />
      </Sphere>
    </group>
  );
};

export const Globe3D = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ff8c00" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00b8d4" />
        <AnimatedGlobe />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default Globe3D;
