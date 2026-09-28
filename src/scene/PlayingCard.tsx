import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cardBackTexture, cardFaceTexture } from './textures';

const CARD_W = 0.62;
const CARD_D = 0.9;

/**
 * A card lying on the felt. It drops in when `visible` turns on, and flips
 * face-up (with a little hop) when `revealed` turns on, after `delay` seconds.
 */
export function PlayingCard({
  position,
  value,
  revealed,
  visible,
  delay = 0,
  castShadow = true,
}: {
  position: [number, number, number];
  value: string | null;
  revealed: boolean;
  visible: boolean;
  delay?: number;
  castShadow?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const flip = useRef(0);
  const drop = useRef(0);
  const revealAt = useRef<number | null>(null);

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: '#e9e2d2', roughness: 0.8 });
    const back = new THREE.MeshStandardMaterial({ map: cardBackTexture(), roughness: 0.55 });
    const face = new THREE.MeshStandardMaterial({
      map: value ? cardFaceTexture(value) : null,
      color: value ? '#ffffff' : '#f4efe4',
      roughness: 0.6,
    });
    // box face order: +x, -x, +y, -y, +z, -z — back on top, face underneath
    return [edge, edge, back, face, edge, edge];
  }, [value]);

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  useEffect(() => {
    revealAt.current = revealed ? performance.now() + delay * 1000 : null;
  }, [revealed, delay]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const step = Math.min(dt, 0.05);

    drop.current += ((visible ? 1 : 0) - drop.current) * Math.min(1, step * 9);
    const wantFlip = revealAt.current !== null && performance.now() >= revealAt.current ? 1 : 0;
    flip.current += (wantFlip - flip.current) * Math.min(1, step * 7);

    const hop = Math.sin(flip.current * Math.PI) * 0.45;
    g.position.set(position[0], position[1] + 0.012 + hop + (1 - drop.current) * 1.2, position[2]);
    g.rotation.z = flip.current * Math.PI;
    g.scale.setScalar(Math.max(0.001, drop.current));
    g.visible = drop.current > 0.02;
  });

  return (
    <group ref={group}>
      <mesh material={materials} castShadow={castShadow}>
        <boxGeometry args={[CARD_W, 0.012, CARD_D]} />
      </mesh>
    </group>
  );
}
