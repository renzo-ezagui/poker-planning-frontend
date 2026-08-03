export function Table() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[3, 32]} />
      <meshStandardMaterial color="#0b5e2a" />
    </mesh>
  );
}
