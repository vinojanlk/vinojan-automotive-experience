import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Phase2Reveal – Implements the signature cover‑reveal sequence.
 *
 * Timeline (normalized scroll progress P):
 * 0.00‑0.28  Covered state – car hidden behind static cover.
 * 0.28‑0.45  Stillness – nothing moves.
 * 0.45‑0.57  Reveal – car translates forward (negative Z) while cover stays.
 * 0.57‑0.75  Post‑reveal stillness – car stays at final forward position.
 * 0.75‑1.00  Camera move – handled by SignatureCamera.
 *
 * The component is deterministic: any value of `scrollProgress.current`
 * directly yields the exact pose, with no side‑effects.
 */
export default function Phase2Reveal({ scrollProgress }) {
  const carGLTF = useGLTF('/models/car.glb')
  const coverGLTF = useGLTF('/models/cover.glb')

  const carScene = useMemo(() => carGLTF.scene.clone(true), [carGLTF.scene])
  const coverScene = useMemo(() => coverGLTF.scene.clone(true), [coverGLTF.scene])

  const carGroup = useRef()
  const coverGroup = useRef()

  // Floor offset to bring wheels onto Y=0
  const floorOffset = 0.45
  const travel = 2.5 // meters forward (negative Z) to fully emerge

  useFrame(() => {
    const p = scrollProgress?.current ?? 0
    // Car Z position based on timeline
    let carZ = 0
    if (p >= 0.45 && p <= 0.57) {
      const t = (p - 0.45) / (0.57 - 0.45) // 0‑>1 over the reveal window
      carZ = -t * travel
    } else if (p > 0.57) {
      carZ = -travel
    }
    if (carGroup.current) {
      carGroup.current.position.set(0, floorOffset, carZ)
    }
    // Cover: visible before reveal, hidden once reveal begins
    if (coverGroup.current) {
      coverGroup.current.visible = p < 0.44
      coverGroup.current.position.set(0, floorOffset, 0)
    }
  })

  return (
    <group name="phase2-reveal">
      {/* Dark matte floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#111" roughness={1} metalness={0} />
      </mesh>

      {/* Stationary cover */}
      <group ref={coverGroup} name="cover-group">
        <primitive object={coverScene} />
      </group>

      {/* Moving car */}
      <group ref={carGroup} name="car-group">
        <primitive object={carScene} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/car.glb')
useGLTF.preload('/models/cover.glb')
