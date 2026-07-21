import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Layers, Params } from '../types';

const GLOW = '#41f5d0';
const SELECT = '#5b8cff';
const AUDIO = '#ec4899';

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

type Vec3 = [number, number, number];

const CREATURE_BASE: Vec3 = [2.6, 0, 2.4];

// WASD / arrow-key state, only bound while enabled.
function usePlayerControls(enabled: boolean) {
  const keys = useRef({ f: false, b: false, l: false, r: false });
  useEffect(() => {
    keys.current = { f: false, b: false, l: false, r: false };
    if (!enabled) return;
    const set = (code: string, val: boolean) => {
      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.f = val;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.b = val;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.l = val;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.r = val;
          break;
      }
    };
    const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const down = (e: KeyboardEvent) => {
      set(e.code, true);
      if (arrows.includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => set(e.code, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [enabled]);
  return keys;
}

function Mushroom({
  position,
  scale = 1,
  params,
  glow,
  mossy,
  animate,
}: {
  position: Vec3;
  scale?: number;
  params: Params;
  glow: boolean;
  mossy: boolean;
  animate: boolean;
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  const stemH = 0.7 * params.stemHeight;
  const capR = 0.34 * params.capRadius;
  const capY = stemH + capR * 0.35;

  useFrame((state) => {
    if (!glow || !matRef.current) return;
    const base = 0.7 * params.glowIntensity;
    matRef.current.emissiveIntensity = animate
      ? base * (0.8 + Math.sin(state.clock.elapsedTime * 2 + position[0] * 1.7) * 0.4)
      : base;
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, stemH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.17, stemH, 12]} />
        <meshStandardMaterial color={'#cfc3a1'} roughness={0.9} />
      </mesh>
      {mossy && (
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.2, 0.24, 0.14, 12]} />
          <meshStandardMaterial color="#3f7d3a" roughness={1} />
        </mesh>
      )}
      <mesh position={[0, capY, 0]} castShadow>
        <sphereGeometry args={[capR, 22, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial
          ref={matRef}
          color={glow ? '#1f8f7e' : '#9aa0a6'}
          emissive={glow ? GLOW : '#000000'}
          emissiveIntensity={glow ? 0.7 * params.glowIntensity : 0}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

function SelectionRing({
  position = [0, 0, 0],
  radius,
  color = SELECT,
}: {
  position?: Vec3;
  radius: number;
  color?: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const p = 1 + Math.sin(s.clock.elapsedTime * 3) * 0.03;
    if (ref.current) ref.current.scale.setScalar(p);
  });
  return (
    <mesh ref={ref} position={[position[0], 0.035, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.9, radius, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Creature({
  mode,
  base = [0, 0, 0],
  selected = false,
  posRef,
}: {
  mode: 'static' | 'loop' | 'player';
  base?: Vec3;
  selected?: boolean;
  posRef?: MutableRefObject<THREE.Vector3>;
}) {
  const ref = useRef<THREE.Group>(null);
  const keys = usePlayerControls(mode === 'player');

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const g = ref.current;
    if (!g) return;

    if (mode === 'player') {
      const k = keys.current;
      let mx = (k.r ? 1 : 0) - (k.l ? 1 : 0);
      let mz = (k.b ? 1 : 0) - (k.f ? 1 : 0);
      const len = Math.hypot(mx, mz);
      if (len > 0) {
        mx /= len;
        mz /= len;
        const spd = 4.2 * Math.min(delta, 0.05);
        g.position.x += mx * spd;
        g.position.z += mz * spd;
        const rad = Math.hypot(g.position.x, g.position.z);
        if (rad > 8.2) {
          g.position.x *= 8.2 / rad;
          g.position.z *= 8.2 / rad;
        }
        g.rotation.y = Math.atan2(mx, mz);
        g.position.y = Math.abs(Math.sin(t * 10)) * 0.08;
      } else {
        g.position.y = 0;
      }
      if (posRef) posRef.current.set(g.position.x, g.position.y, g.position.z);
      return;
    }

    if (mode === 'loop') {
      g.position.set(base[0], base[1] + Math.abs(Math.sin(t * 4)) * 0.07, base[2]);
      g.rotation.y = Math.sin(t * 0.8) * 0.4;
    } else {
      g.position.set(base[0], base[1], base[2]);
      g.rotation.y = 0.35;
    }
  });

  return (
    <group ref={ref} position={base}>
      {selected && <SelectionRing radius={0.85} />}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.5, 6, 12]} />
        <meshStandardMaterial color="#e06b9a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.0, 0.18]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f08fb5" roughness={0.6} />
      </mesh>
      <mesh position={[0.09, 1.05, 0.36]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive={GLOW} emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[-0.09, 1.05, 0.36]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive={GLOW} emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
}

// Third-person follow used while the creature is player-controlled. It keeps the
// orbit target on the creature and shifts the camera by the same delta, so the
// user's own drag/zoom offset is preserved (you can still look around).
function PlayFollow({
  posRef,
  controlsRef,
}: {
  posRef: MutableRefObject<THREE.Vector3>;
  controlsRef: MutableRefObject<{ target: THREE.Vector3; update: () => void } | null>;
}) {
  const { camera } = useThree();
  const last = useRef(new THREE.Vector3());

  useEffect(() => {
    const c = controlsRef.current;
    const p = posRef.current;
    last.current.copy(p);
    if (!c) return;
    c.target.set(p.x, 0.6, p.z);
    camera.position.set(p.x, 4.6, p.z + 7);
    c.update();
  }, [camera, controlsRef, posRef]);

  useFrame(() => {
    const c = controlsRef.current;
    if (!c) return;
    const p = posRef.current;
    const dx = p.x - last.current.x;
    const dz = p.z - last.current.z;
    if (dx !== 0 || dz !== 0) {
      camera.position.x += dx;
      camera.position.z += dz;
      c.target.x += dx;
      c.target.z += dz;
      c.update();
    }
    last.current.set(p.x, p.y, p.z);
  });
  return null;
}

// Reframes the orbit camera when the focus target changes (Edit mode).
function FocusController({
  focus,
  controlsRef,
}: {
  focus: 'none' | 'creature';
  controlsRef: MutableRefObject<{ target: THREE.Vector3; update: () => void } | null>;
}) {
  const { camera } = useThree();
  useEffect(() => {
    const controls = controlsRef.current;
    let target: Vec3;
    let pos: Vec3;
    if (focus === 'creature') {
      const [x, , z] = CREATURE_BASE;
      target = [x, 0.6, z];
      pos = [x + 2.4, 2.2, z + 3.4];
    } else {
      target = [0, 0, 0];
      pos = [6.5, 5, 7.5];
    }
    camera.position.set(...pos);
    if (controls) {
      controls.target.set(...target);
      controls.update();
    }
    camera.lookAt(...target);
  }, [focus, camera, controlsRef]);
  return null;
}

function SoundPulse({ position }: { position: Vec3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.6 + position[0] * 0.3) % 1;
    if (ref.current) ref.current.scale.setScalar(0.4 + t * 2.4);
    if (matRef.current) matRef.current.opacity = 0.5 * (1 - t);
  });
  return (
    <mesh ref={ref} position={[position[0], 0.03, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.4, 0.5, 32]} />
      <meshBasicMaterial ref={matRef} color={AUDIO} transparent opacity={0.4} />
    </mesh>
  );
}

function AudioEmitterGizmo({ position }: { position: Vec3 }) {
  return (
    <group position={[position[0], 1.35, position[2]]}>
      <mesh>
        <octahedronGeometry args={[0.11, 0]} />
        <meshStandardMaterial color={AUDIO} emissive={AUDIO} emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[0.17, 0.2, 24]} />
        <meshBasicMaterial color={AUDIO} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function ListenerGizmo() {
  return (
    <group position={[0, 0.05, 4.2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.55, 32]} />
        <meshBasicMaterial color={AUDIO} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={AUDIO} emissive={AUDIO} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function Grove({
  layers,
  params,
  selected,
  animate,
  rigLoop,
  playerPos,
}: {
  layers: Layers;
  params: Params;
  selected: string;
  animate: boolean;
  rigLoop: boolean;
  playerPos: MutableRefObject<THREE.Vector3>;
}) {
  const field = useMemo(() => {
    const rnd = seeded(42);
    const arr: { pos: Vec3; scale: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 1.4 + rnd() * 5.4;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (Math.abs(x) < 0.8) continue; // keep the path clear
      arr.push({ pos: [x, 0, z], scale: 0.65 + rnd() * 0.7 });
    }
    return arr;
  }, []);

  const { glow, scatter, creature, sound } = layers;
  const heroSel = selected === 'hero';
  const areaSel = selected === 'field' || selected === 'material' || selected === 'sound';
  const terrainSel = selected === 'terrain';
  const emitters = field.filter((_, i) => i % 6 === 0);

  return (
    <>
      <Mushroom position={[0, 0, 0]} scale={1.6} params={params} glow={glow} mossy={glow} animate={animate} />
      {scatter &&
        field.map((m, i) => (
          <Mushroom
            key={i}
            position={m.pos}
            scale={m.scale}
            params={params}
            glow={glow}
            mossy={glow}
            animate={animate}
          />
        ))}

      {creature && (
        <Creature
          mode={animate ? 'player' : rigLoop ? 'loop' : 'static'}
          base={CREATURE_BASE}
          selected={selected === 'creature' || selected === 'alien-material' || selected === 'alien-anim'}
          posRef={playerPos}
        />
      )}

      {sound &&
        (animate ? (
          <>
            <SoundPulse position={[0, 0, 0]} />
            {scatter && emitters.map((m, i) => <SoundPulse key={i} position={m.pos} />)}
            <ListenerGizmo />
          </>
        ) : (
          <>
            <AudioEmitterGizmo position={[0, 0, 0]} />
            {scatter && emitters.map((m, i) => <AudioEmitterGizmo key={i} position={m.pos} />)}
            <ListenerGizmo />
          </>
        ))}

      {heroSel && <SelectionRing position={[0, 0, 0]} radius={0.95} />}
      {areaSel && <SelectionRing position={[0, 0, 0]} radius={7} />}
      {terrainSel && <SelectionRing position={[0, 0, 0]} radius={8.8} />}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 48]} />
        <meshStandardMaterial color="#141a24" roughness={1} />
      </mesh>
    </>
  );
}

export default function Scene3D({
  layers,
  params,
  selected,
  animate,
  focus,
  rigLoop,
  empty = false,
}: {
  layers: Layers;
  params: Params;
  selected: string;
  animate: boolean;
  focus: 'none' | 'creature';
  rigLoop: boolean;
  empty?: boolean;
}) {
  const playerPos = useRef(new THREE.Vector3(...CREATURE_BASE));
  const controlsRef = useRef<{ target: THREE.Vector3; update: () => void } | null>(null);

  return (
    <Canvas
      shadows
      camera={{ position: [6.5, 5, 7.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
    >
      <color attach="background" args={['#0c0f16']} />
      <fog attach="fog" args={['#0c0f16', 12, 26]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight
        position={[0, 2, 0]}
        intensity={!empty && layers.glow ? 12 * params.glowIntensity : 0}
        color={GLOW}
        distance={14}
      />

      {!empty && (
        <Grove
          layers={layers}
          params={params}
          selected={selected}
          animate={animate}
          rigLoop={rigLoop}
          playerPos={playerPos}
        />
      )}

      <OrbitControls
        ref={controlsRef as never}
        enablePan={false}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={16}
      />
      {!empty &&
        (animate ? (
          <PlayFollow posRef={playerPos} controlsRef={controlsRef} />
        ) : (
          <FocusController focus={focus} controlsRef={controlsRef} />
        ))}
    </Canvas>
  );
}
