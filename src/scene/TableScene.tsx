import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayingCard } from './PlayingCard';
import { Seat, type SeatActions } from './Seat';
import { feltNoiseTexture, whenFontsReady } from './textures';
import type { RosterEntry, Vote } from '../socket/useRoom';
import type { Theme } from '../themes';

const RX = 3.6; // seat ellipse radii (on the felt, inside the rail)
const RZ = 2.4;
const TABLE_SCALE_X = 1.36;

function isLowPower() {
  if (typeof window === 'undefined') return true;
  const small = window.matchMedia?.('(max-width: 700px)').matches ?? false;
  const cores = navigator.hardwareConcurrency ?? 4;
  return small || cores <= 4;
}

function Table({ shadows, portrait, theme }: { shadows: boolean; portrait: boolean; theme: Theme }) {
  const felt = useMemo(() => feltNoiseTexture(theme.id), [theme.id]);
  const sc = theme.scene;
  const seg = sc.segments;
  return (
    <group scale={portrait ? [1, 1, TABLE_SCALE_X] : [TABLE_SCALE_X, 1, 1]}>
      {/* felt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={shadows}>
        <circleGeometry args={[3, seg]} />
        <meshStandardMaterial color={sc.felt} roughness={0.95} map={felt} flatShading={sc.flat} />
      </mesh>
      {/* inner betting line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[1.95, sc.flat ? 2.02 : 1.98, Math.max(seg, 24)]} />
        <meshBasicMaterial color={sc.line} transparent opacity={sc.lineOpacity} />
      </mesh>
      {/* rail */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} castShadow={shadows} receiveShadow={shadows}>
        <torusGeometry args={[3.12, 0.2, sc.flat ? 4 : 24, sc.flat ? seg : 128]} />
        <meshStandardMaterial color={sc.rail} roughness={sc.flat ? 0.95 : 0.42} metalness={0.05} flatShading={sc.flat} />
      </mesh>
      {/* table body — top sits just under the felt; sharing y=0 z-fights into streaks */}
      <mesh position={[0, -0.47, 0]} receiveShadow={shadows}>
        <cylinderGeometry args={[3.2, 2.9, 0.9, seg]} />
        <meshStandardMaterial color={sc.body} roughness={0.7} flatShading={sc.flat} />
      </mesh>
    </group>
  );
}

function Gem({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed;
    ref.current.rotation.y = t;
    ref.current.position.y = position[1] + Math.sin(t * 1.7) * 0.06;
  });
  return (
    <mesh ref={ref} position={position} castShadow>
      <octahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.3} flatShading />
    </mesh>
  );
}

function Torch({ position }: { position: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null);
  const flame = useRef<THREE.Mesh>(null);
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + seed;
    // stepped flicker: sums of sines, quantized so it feels 8-bit rather than smooth
    const f = Math.round((Math.sin(t * 9) * 0.5 + Math.sin(t * 23) * 0.3 + Math.sin(t * 3.1) * 0.2) * 4) / 4;
    if (light.current) light.current.intensity = 9 + f * 2.5;
    if (flame.current) flame.current.scale.set(1, 1 + f * 0.18, 1);
  });
  return (
    <group position={position}>
      {/* sconce standing on the rail */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#4a3222" flatShading />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.24, 0.08, 0.24]} />
        <meshStandardMaterial color="#6b6478" flatShading />
      </mesh>
      <mesh ref={flame} position={[0, 0.8, 0]}>
        <boxGeometry args={[0.16, 0.26, 0.16]} />
        <meshBasicMaterial color="#ffc24a" />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.08]} />
        <meshBasicMaterial color="#fff1b8" />
      </mesh>
      <pointLight ref={light} color="#ff9a3c" intensity={9} distance={8} decay={1.4} position={[0, 1, 0]} />
    </group>
  );
}

function ChipStack({ position, colors }: { position: [number, number, number]; colors: string[] }) {
  return (
    <group position={position}>
      {colors.map((c, i) => (
        <mesh key={i} position={[0, 0.03 + i * 0.045, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 28]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ focus, portrait }: { focus: boolean; portrait: boolean }) {
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0, portrait ? 0.4 : 0.6), [portrait]);
  const dir = useMemo(
    () => (portrait ? new THREE.Vector3(0, 8.6, 5.2) : new THREE.Vector3(0, 7.4, 7.6)).normalize(),
    [portrait],
  );
  useFrame(({ clock }, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const wantFov = portrait ? 50 : 38;
    if (cam.fov !== wantFov) {
      cam.fov = wantFov;
      cam.updateProjectionMatrix();
    }
    const aspect = size.width / Math.max(1, size.height);
    // distance so the table (plus a margin) fits the screen width
    const halfWidth = portrait ? 3.5 : 4.7;
    const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(wantFov) / 2) * aspect);
    const fitDist = Math.max(portrait ? 9 : 11.2, halfWidth / Math.tan(hfov / 2));
    const dist = fitDist * (focus ? 0.94 : 1);
    const t = clock.getElapsedTime();
    const desired = dir.clone().multiplyScalar(dist).add(target);
    desired.x += Math.sin(t * 0.08) * 0.35;
    camera.position.lerp(desired, Math.min(1, dt * 1.8));
    camera.lookAt(target);
  });
  return null;
}

function usePortrait() {
  const get = () => (typeof window === 'undefined' ? false : window.innerWidth / window.innerHeight < 0.85);
  const [portrait, setPortrait] = useState(get);
  useEffect(() => {
    const onResize = () => setPortrait(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return portrait;
}

export function TableScene({
  participants,
  meId,
  votedIds,
  votes,
  revealed,
  myVote,
  canModerate,
  actions,
  theme,
}: {
  theme: Theme;
  participants: RosterEntry[];
  meId: string | null;
  votedIds: string[];
  votes: Vote[];
  revealed: boolean;
  myVote: string | null;
  canModerate: boolean;
  actions: SeatActions;
}) {
  const [lowPower] = useState(isLowPower);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const portrait = usePortrait();
  const [, setFontsReady] = useState(false);

  useEffect(() => {
    whenFontsReady().then(() => setFontsReady(true));
  }, []);

  // rotate the circle so that "me" always sits at the front, facing the camera
  const seats = useMemo(() => {
    const n = participants.length;
    const meIndex = Math.max(0, participants.findIndex((p) => p.participantId === meId));
    return participants.map((p, i) => {
      const angle = Math.PI / 2 + ((i - meIndex) / Math.max(1, n)) * Math.PI * 2;
      // portrait screens get the table's long axis running away from the camera
      const x = Math.cos(angle) * (portrait ? RZ : RX);
      const z = Math.sin(angle) * (portrait ? RX : RZ);
      return { entry: p, seat: [x, 0.02, z] as [number, number, number], card: [x * 0.6, 0, z * 0.52] as [number, number, number] };
    });
  }, [participants, meId, portrait]);

  const voteById = useMemo(() => new Map(votes.map((v) => [v.participantId, v.value])), [votes]);

  return (
    <Canvas
      key={theme.id}
      className={theme.pixelScale ? 'pixelated' : undefined}
      shadows={!lowPower}
      dpr={theme.pixelScale ?? (lowPower ? 1 : [1, 1.75])}
      gl={{ antialias: !lowPower && !theme.pixelScale, alpha: true }}
      camera={{ position: [0, 9, 9], fov: 38 }}
      onPointerMissed={() => setMenuFor(null)}
    >
      <hemisphereLight args={[theme.scene.hemiSky, theme.scene.hemiGround, theme.scene.torches ? 0.75 : 0.55]} />
      <ambientLight intensity={theme.scene.torches ? 0.3 : 0.25} />
      <spotLight
        position={[0, 9, 1.5]}
        angle={0.62}
        penumbra={0.75}
        intensity={theme.scene.torches ? 80 : 90}
        decay={2}
        color={theme.scene.light}
        castShadow={!lowPower}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
      />
      {theme.scene.torches && (
        <>
          {/* on the rail: at the sides in landscape, at the far corners in portrait */}
          <Torch position={portrait ? [-1.56, 0.1, -3.12 * TABLE_SCALE_X * 0.866] : [-3.12 * TABLE_SCALE_X, 0.1, 0]} />
          <Torch position={portrait ? [1.56, 0.1, -3.12 * TABLE_SCALE_X * 0.866] : [3.12 * TABLE_SCALE_X, 0.1, 0]} />
        </>
      )}
      <CameraRig focus={revealed} portrait={portrait} />
      <Table shadows={!lowPower} portrait={portrait} theme={theme} />
      {theme.scene.decor === 'gems' ? (
        <>
          <Gem position={[-0.42, 0.34, 0.05]} color="#5fd0c8" speed={0.9} />
          <Gem position={[0.42, 0.38, 0]} color="#e0503c" speed={1.1} />
          <Gem position={[0, 0.32, -0.38]} color="#ffcc4d" speed={0.75} />
        </>
      ) : (
        <>
          <ChipStack position={[-0.55, 0, -0.15]} colors={['#7a2622', '#7a2622', '#f4efe4', '#d6a24a']} />
          <ChipStack position={[0.5, 0, -0.35]} colors={['#1f3b5c', '#f4efe4', '#1f3b5c']} />
          <ChipStack position={[0.05, 0, -0.75]} colors={['#d6a24a', '#d6a24a']} />
        </>
      )}

      {seats.map(({ entry, seat, card }, i) => {
        const isMe = entry.participantId === meId;
        const hasVoted = votedIds.includes(entry.participantId) || (isMe && myVote !== null);
        const value = voteById.get(entry.participantId) ?? (isMe ? myVote : null);
        return (
          <group key={entry.participantId}>
            <Seat
              entry={entry}
              position={seat}
              isMe={isMe}
              hasVoted={hasVoted}
              canModerate={canModerate}
              menuOpen={menuFor === entry.participantId}
              onToggleMenu={setMenuFor}
              actions={actions}
              theme={theme}
            />
            {!entry.isSpectator && (
              <PlayingCard
                position={card}
                value={revealed ? (value ?? null) : null}
                revealed={revealed && value != null}
                visible={hasVoted}
                delay={i * 0.12}
                castShadow={!lowPower}
                theme={theme.id}
              />
            )}
          </group>
        );
      })}
    </Canvas>
  );
}
