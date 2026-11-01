import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'

/**
 * StudioEnvironment
 *
 * The dark photographic studio that wraps the car.
 *
 * - Background: near-black with a hint of blue-black (#050507)
 * - Fog: exponential, same colour — creates depth without revealing studio edges
 * - Floor: dark reflective surface — barely perceptible in Scene 01,
 *   becomes more significant as lighting intensifies during the reveal.
 *
 * MeshReflectorMaterial can be upgraded in Phase 2 (higher resolution,
 * adjusted blur) once the car model is present and lighting is tuned.
 */
export default function StudioEnvironment() {
  const { scene } = useThree()

  useEffect(() => {
    // Atmospheric exponential fog — deepens darkness at the edges
    scene.fog = new THREE.FogExp2('#050507', 0.038)
    return () => {
      scene.fog = null
    }
  }, [scene])

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow={false}
    >
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
        color="#080810"
        metalness={0.6}
        mirror={0}
      />
    </mesh>
  )
}
