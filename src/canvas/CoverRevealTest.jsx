import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * CoverRevealTest – minimal prototype for the cover reveal.
 *
 * Components:
 *  - Dark floor (plane)
 *  - Hero car GLB loaded from public/models/car.glb
 *  - Simple red cover (box) that initially hides the car.
 *  - Scroll‑driven car translation; the cover stays static.
 *
 * All positions are deterministic based on the scrollProgress ref passed
 * from App. No animations, timers or side‑effects are used – the same
 * progress value always yields the same pose.
 */
export default function CoverRevealTest({ scrollProgress }) {
  // Load the GLB – it contains a single root node "senna" with children for wheels.
  const { scene } = useGLTF('/models/car.glb') // path is relative to public folder

  // Ref for the group that holds everything so we can apply a floor offset once.
  const groupRef = useRef()

  // Compute floor offset: the model's lowest Y is approximately -0.4985.
  // We raise it by +0.5 so the wheels sit on Y=0.
  const floorOffset = 0.5

  // Travel distance for the car during the reveal (in world units).
  const travel = 4 // ~two car lengths, enough to clear the cover

  // Simple red cover geometry – a thin box covering the car's bounding box.
  const coverSize = { x: 3.1, y: 1.8, z: 0.2 }

  // UseFrame updates positions each frame based on scrollProgress.
  useFrame(() => {
    const p = scrollProgress.current // 0 → 1
    // Car moves forward (negative Z) as progress increases.
    const carZ = -p * travel
    if (groupRef.current) {
      // Apply floor offset once (same for car and cover).
      groupRef.current.position.set(0, floorOffset, 0)
    }
    // Car mesh – we keep a reference to the loaded scene.
    if (scene) {
      scene.position.set(0, 0, carZ)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Dark floor – simple plane with a matte black material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#111" roughness={1} metalness={0} />
      </mesh>

      {/* Red cover – static box that initially sits over the car */}
      <mesh position={[0, coverSize.y / 2, 0]}>
        <boxGeometry args={[coverSize.x, coverSize.y, coverSize.z]} />
        <meshStandardMaterial color="red" transparent={true} opacity={0.95} />
      </mesh>

      {/* Hero car – GLB scene */}
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload('/models/car.glb')
