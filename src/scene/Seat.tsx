import { Text } from '@react-three/drei';
import { Card } from './Card';

export function Seat({
  position,
  name,
  hasVoted,
  revealed,
  value,
}: {
  position: [number, number, number];
  name: string;
  hasVoted: boolean;
  revealed: boolean;
  value: string;
}) {
  return (
    <group position={position}>
      <Card revealed={revealed} value={value} />
      <Text position={[0, -0.8, 0]} fontSize={0.2} color="white">
        {name}
        {hasVoted && !revealed ? ' ✓' : ''}
      </Text>
    </group>
  );
}
