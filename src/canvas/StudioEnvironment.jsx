import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { MeshReflectorMaterial, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

/**
 * StudioEnvironment
 *
 * The dark photographic studio that wraps the car.
 * - Background: near-black with a hint of blue-black (#050507)
 * - Fog: exponential, same colour — creates depth without revealing studio edges
 * - Floor: dark reflective surface — barely perceptible in Scene 01, becomes more significant as lighting intensifies.
 * - Grounding: contact footprint & subtle asymmetric background depth.
 * - Procedural Studio Environment: Drei Environment + Lightformer reflection geometry.
 */
export default function StudioEnvironment() {
  const { scene } = useThree();

  // Atmospheric exponential fog – deepens darkness at the edges
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#050507', 0.038);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      {/* Procedural studio reflection bank – off-screen softboxes for automotive clearcoat reflections */}
      <Environment resolution={256} frames={1} background={false} environmentIntensity={0.8}>
        {/* 1. Long overhead cool-white softbox: reveals hood, roofline, rear wing */}
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#f0f4f8"
          scale={[3, 14, 1]}
          position={[0, 5, -1]}
          rotation={[-Math.PI / 2, 0, 0]}
        />

        {/* 2. Elevated side/flank softbox: defines waistline, side air intakes, fender curve */}
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#e2e8f0"
          scale={[2, 10, 1]}
          position={[4.5, 2.5, -1.5]}
          rotation={[0, -Math.PI / 3, 0]}
        />

        {/* 3. Subtle low ground/fill reflection: provides faint bounce to lower aero diffusers */}
        <Lightformer
          form="rect"
          intensity={0.3}
          color="#94a3b8"
          scale={[3, 10, 1]}
          position={[-4, 0.5, -2]}
          rotation={[Math.PI / 4, Math.PI / 4, 0]}
        />
      </Environment>

      {/* Contact grounding – wider soft dark spot beneath the car */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[4, 2.5]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {/* Asymmetric background depth – enhanced tonal separation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.04, -5]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#040404" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      {/* Main reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          blur={[512, 128]}
          resolution={512}
          mixBlur={1.2}
          mixStrength={8}
          roughness={0.98}
          depthScale={0.8}
          minDepthThreshold={0.9}
          maxDepthThreshold={1.0}
          color="#0a0a0a"
          metalness={0.6}
          mirror={0}
        />
      </mesh>
    </>
  );
}
