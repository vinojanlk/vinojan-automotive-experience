import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import CinematicCamera from './CinematicCamera'
import StudioEnvironment from './StudioEnvironment'
import StudioLighting from './StudioLighting'
import SignatureCamera from './SignatureCamera'
import Phase2Reveal from './Phase2Reveal'
import GalleryArchitecture from './GalleryArchitecture'
import PostEffects from './PostEffects'

/**
 * SceneCanvas
 *
 * The single persistent Three.js canvas.
 * Lives inside the sticky viewport — never unmounts.
 * All animated values are driven by scrollProgress ref via useFrame,
 * so there are no React re-renders during the scroll experience.
 */
export default function SceneCanvas({ scrollProgress }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Deep black background — set at the Three.js level */}
      <color attach="background" args={['#050507']} />

      <Suspense fallback={null}>
        {/* Camera locked during reveal – controlled by SignatureCamera */}
        <SignatureCamera scrollProgress={scrollProgress} />

        {/* Studio: dark floor with subtle reflection, atmospheric fog & grounding */}
        <StudioEnvironment />

        {/* Midnight gallery architecture – emerges after reveal */}
        <GalleryArchitecture scrollProgress={scrollProgress} />

        {/* Lighting rig — all intensities start near-zero, animate with scroll */}
        <StudioLighting scrollProgress={scrollProgress} />

        {/* Phase 2 signature reveal */}
        <Phase2Reveal scrollProgress={scrollProgress} />

        {/* Post-processing: restrained Bloom + Vignette */}
        <PostEffects />
      </Suspense>
    </Canvas>
  )
}
