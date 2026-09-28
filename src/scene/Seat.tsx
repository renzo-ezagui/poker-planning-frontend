import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { colorFor, initials } from '../lib/avatar';
import type { RosterEntry } from '../socket/useRoom';
import type { Theme } from '../themes';

export interface SeatActions {
  kick: (id: string) => void;
  mute: (id: string, muted: boolean) => void;
  ban: (id: string) => void;
}

export function Seat({
  entry,
  position,
  isMe,
  hasVoted,
  canModerate,
  menuOpen,
  onToggleMenu,
  actions,
  theme,
}: {
  theme: Theme;
  entry: RosterEntry;
  position: [number, number, number];
  isMe: boolean;
  hasVoted: boolean;
  canModerate: boolean;
  menuOpen: boolean;
  onToggleMenu: (id: string | null) => void;
  actions: SeatActions;
}) {
  const puck = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const color = colorFor(entry.participantId, theme.scene.palette);
  const wire = theme.scene.style === 'wire';
  const wireBox = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.62, 0.44, 0.62)), []);
  const clickable = canModerate && !entry.isHost && !isMe;

  useFrame((_, dt) => {
    if (!puck.current) return;
    const target = hovered && clickable ? 0.12 : 0;
    puck.current.position.y += (target - puck.current.position.y) * Math.min(1, dt * 10);
  });

  return (
    <group position={position}>
      <group
        ref={puck}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          if (clickable) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          if (!clickable) return;
          e.stopPropagation();
          onToggleMenu(menuOpen ? null : entry.participantId);
        }}
      >
        {wire ? (
          <>
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[0.6, 0.42, 0.6]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <lineSegments geometry={wireBox} position={[0, 0.22, 0]}>
              <lineBasicMaterial color={color} />
            </lineSegments>
          </>
        ) : theme.scene.puck === 'block' ? (
          <>
            <mesh castShadow position={[0, 0.22, 0]}>
              <boxGeometry args={[0.62, 0.44, 0.62]} />
              <meshStandardMaterial color={color} roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0, 0.445, 0]}>
              <boxGeometry args={[0.46, 0.012, 0.46]} />
              <meshStandardMaterial color="#f3e9d2" roughness={0.9} />
            </mesh>
          </>
        ) : (
          <>
            <mesh castShadow position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.36, 0.4, 0.32, 40]} />
              <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.325, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.012, 40]} />
              <meshStandardMaterial color="#f4efe4" roughness={0.7} />
            </mesh>
          </>
        )}
        {isMe && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.56, theme.scene.puck === 'block' ? 4 : 48, 1, Math.PI / 4]} />
            <meshBasicMaterial color={theme.scene.line} transparent opacity={0.9} />
          </mesh>
        )}
        <Html position={[0, theme.scene.puck === 'block' ? 0.46 : 0.34, 0]} center zIndexRange={[4, 0]}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: wire ? 20 : theme.scene.puck === 'block' ? 11 : 15,
              color: wire ? color : '#1d1b17',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {initials(entry.name)}
          </div>
        </Html>
      </group>

      <Html position={[0, -0.05, 0.62]} center zIndexRange={[5, 0]}>
        <div className="seat-label">
          <div className={`seat-name${isMe ? ' me' : ''}`}>
            {!entry.isSpectator && <i className={`seat-dot${hasVoted ? ' voted' : ''}`} aria-hidden />}
            <span>{entry.name}</span>
            {entry.muted && <span aria-label="muted" title="Muted">·&nbsp;muted</span>}
          </div>
          {entry.isHost && <div className="seat-tag">Host</div>}
          {!entry.isHost && entry.isSpectator && <div className="seat-tag spectator">Watching</div>}
        </div>
      </Html>

      {menuOpen && (
        <Html position={[0, 0.9, 0]} center zIndexRange={[20, 10]}>
          <div className="seat-menu" onPointerDown={(e) => e.stopPropagation()}>
            <div className="seat-menu-head">
              <strong>{entry.name}</strong>
              <span className="eyebrow">{entry.isSpectator ? 'Watching' : 'Voter'}</span>
            </div>
            <div className="seat-menu-actions">
              <button
                className="btn btn-sm"
                onClick={() => {
                  actions.mute(entry.participantId, !entry.muted);
                  onToggleMenu(null);
                }}
              >
                {entry.muted ? 'Unmute' : 'Mute'}
              </button>
              <button
                className="btn btn-sm"
                onClick={() => {
                  actions.kick(entry.participantId);
                  onToggleMenu(null);
                }}
              >
                Kick
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  actions.ban(entry.participantId);
                  onToggleMenu(null);
                }}
              >
                Ban
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
