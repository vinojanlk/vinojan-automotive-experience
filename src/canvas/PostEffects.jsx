import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

/**
 * PostEffects
 *
 * Restrained post-processing stack.
 *
 * Bloom:
 *   High luminance threshold — only the brightest highlights bloom.
 *   In Scene 01 (darkness), nothing blooms. When headlights ignite,
 *   they bloom naturally. The environment should not glow.
 *   visual-quality-auditor rule: Bloom intensity locked ≤ 0.4.
 *   Neon-glow aesthetics are explicitly rejected.
 *
 * Vignette:
 *   Darkens edges. Deepens the photographic / cinematic feel.
 *   Should be present but invisible as a named effect.
 */
export default function PostEffects() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.85}
        luminanceSmoothing={0.9}
        intensity={0.35}
        blendFunction={BlendFunction.ADD}
      />
      <Vignette
        eskil={false}
        offset={0.12}
        darkness={0.75}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
