import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

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

  const carScene = useMemo(() => {
    const clone = carGLTF.scene.clone(true)

    // Instantiate upgraded materials once (MeshPhysicalMaterial with clearcoat for liquid automotive finish)
    const bodyPaintMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#232528'),
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      roughness: 0.18,
      metalness: 0.35,
      envMapIntensity: 1.25,
    })

    const orangeAccentMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#d44e00'),
      clearcoat: 0.8,
      clearcoatRoughness: 0.08,
      roughness: 0.22,
      metalness: 0.15,
      envMapIntensity: 1.2,
    })

    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#111214'),
      roughness: 0.38,
      metalness: 0.30,
      clearcoat: 0.35,
      clearcoatRoughness: 0.20,
      envMapIntensity: 1.0,
    })

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0b0d10'),
      roughness: 0.02,
      metalness: 0.1,
      transparent: true,
      opacity: 0.72,
      envMapIntensity: 1.6,
      depthWrite: false,
    })

    const headlightLensMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      roughness: 0.05,
      metalness: 0.05,
      transparent: true,
      opacity: 0.35,
      envMapIntensity: 1.5,
      depthWrite: false,
    })

    const headlightInternalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#151618'),
      roughness: 0.2,
      metalness: 0.8,
      emissive: new THREE.Color('#d8e6ff'),
      emissiveIntensity: 0.5,
    })

    const caliperMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#c41818'),
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      roughness: 0.2,
      metalness: 0.2,
    })

    // Tyre rubber remains non-metallic and light-absorbing
    const tyreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#131315'),
      roughness: 0.75,
      metalness: 0.0,
    })

    const interiorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0a0b0d'),
      roughness: 0.9,
      metalness: 0.05,
    })

    const mechanicalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6a6c70'),
      roughness: 0.35,
      metalness: 0.8,
    })

    const tailLightMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#7a0606'),
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
    })

    const mapMaterial = (mat) => {
      if (!mat) return mat
      const name = mat.name || ''
      if (name === 'BodyPaint') return bodyPaintMat
      if (name === 'OrangeBody') return orangeAccentMat
      if (name === 'Crbon' || name === 'BlackMetallic') return carbonMat
      if (name === 'Glass' || name === 'Windows') return glassMat
      if (name === 'Translucent') return headlightLensMat
      if (name === 'Headlight') return headlightInternalMat
      if (name.startsWith('wire_135006006')) return caliperMat
      if (name.startsWith('wire_162162162')) return tyreMat
      if (name === 'BackLighs' || name === 'Baclight' || name === 'Red Light' || name === 'Back Plate') return tailLightMat
      if (name === 'Metallic' || name === 'Shining' || name === 'Top') return mechanicalMat
      return interiorMat
    }

    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map(mapMaterial)
        } else {
          child.material = mapMaterial(child.material)
        }
      }
    })

    return clone
  }, [carGLTF.scene])

  const coverScene = useMemo(() => {
    const clone = coverGLTF.scene.clone(true)

    clone.traverse((child) => {
      if (child.isMesh && child.geometry) {
        // 1. clone geometry
        const geom = child.geometry.clone()
        // 2. remove existing normal attribute
        geom.deleteAttribute('normal')
        // 3. preserve UVs (geom.attributes.uv remains intact)
        // 4. merge split vertices with 1e-4 tolerance
        const merged = mergeVertices(geom, 1e-4)
        // 5. compute vertex normals
        merged.computeVertexNormals()
        // 6. assign processed geometry to cloned mesh
        child.geometry = merged

        // 7. clone its material
        if (child.material) {
          child.material = child.material.clone()
          // 8. set flatShading = false
          child.material.flatShading = false
          // 9. set needsUpdate = true
          child.material.needsUpdate = true
        }
      }
    })

    return clone
  }, [coverGLTF.scene])

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

    const coverVisible = p < 0.44

    if (carGroup.current) {
      carGroup.current.visible = !coverVisible
      carGroup.current.position.set(0, floorOffset, carZ)
    }
    // Cover: visible before reveal, hidden once reveal begins
    if (coverGroup.current) {
      coverGroup.current.visible = coverVisible
      coverGroup.current.position.set(0, floorOffset, 0)
    }
  })

  return (
    <group name="phase2-reveal">
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
