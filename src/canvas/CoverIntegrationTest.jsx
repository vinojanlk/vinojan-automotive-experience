import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * CoverIntegrationTest
 *
 * Integration check between:
 *  - public/models/car.glb
 *  - public/models/cover.glb (authored red cloth asset)
 *
 * Evaluates:
 *  1. Both GLBs loading in the same R3F scene.
 *  2. Alignment, coordinate alignment, scale, orientation.
 *  3. Concealment of car under cover.
 *  4. Independent movement of car along Z away from stationary cover.
 */
export default function CoverIntegrationTest({ scrollProgress }) {
  const carGLTF = useGLTF('/models/car.glb')
  const coverGLTF = useGLTF('/models/cover.glb')

  // Clone scenes so multiple instances or hot-reloads don't mutate shared cached scenes
  const carScene = useMemo(() => carGLTF.scene.clone(true), [carGLTF.scene])
  const coverScene = useMemo(() => coverGLTF.scene.clone(true), [coverGLTF.scene])

  // Ensure cover material renders as opaque deep red
  useMemo(() => {
    coverScene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#b30006',
          roughness: 0.6,
          metalness: 0.1,
          side: THREE.DoubleSide,
        })
      }
    })
  }, [coverScene])

  const carGroupRef = useRef()
  const coverGroupRef = useRef()

  // The car's lowest wheel point in its local coordinate system is Y ~ -0.45.
  // Raising by +0.45 aligns the tires to the floor at Y = 0.
  const floorOffset = 0.45
  const travelDistance = 8.0 // Forward travel along -Z to demonstrate independent separation

  useFrame(() => {
    const p = scrollProgress ? scrollProgress.current : 0
    if (carGroupRef.current) {
      // Car moves forward (-Z) while maintaining Y floor contact (+0.45)
      carGroupRef.current.position.set(0, floorOffset, -p * travelDistance)
    }
    if (coverGroupRef.current) {
      // Stationary cover positioned directly on the floor
      coverGroupRef.current.position.set(0, floorOffset, 0)
    }
  })

  return (
    <group name="cover-integration-test">
      {/* Matte dark studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Stationary Authored Red Cover */}
      <group ref={coverGroupRef} name="hero-cover-group">
        <primitive object={coverScene} />
      </group>

      {/* Hero Vehicle (moves forward on scroll) */}
      <group ref={carGroupRef} name="hero-car-group">
        <primitive object={carScene} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/car.glb')
useGLTF.preload('/models/cover.glb')
