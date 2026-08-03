import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function Card({ revealed, value }: { revealed: boolean; value: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef(revealed ? Math.PI : 0);

  useEffect(() => {
    targetRotation.current = revealed ? Math.PI : 0;
  }, [revealed]);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y +=
      (targetRotation.current - meshRef.current.rotation.y) * 0.15;
  });

  return (
    <mesh ref={meshRef} scale={[0.6, 0.9, 0.02]}>
      <boxGeometry />
      <meshStandardMaterial color={revealed ? 'white' : 'navy'} />
      {revealed && (
        <Text position={[0, 0, 0.02]} fontSize={0.3} color="black">
          {value}
        </Text>
      )}
    </mesh>
  );
}
