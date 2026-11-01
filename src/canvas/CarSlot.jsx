/**
 * CarSlot
 *
 * Phase 1: Empty placeholder group at the origin of the scene.
 * The hero vehicle will be loaded and placed here in Phase 3.
 *
 * Architecture is intentionally model-agnostic:
 * - Drop any GLTF/GLB into this group without touching other components.
 * - Mesh separation (body, glass, wheels, lights) happens inside this component.
 * - All lighting, camera, and scroll systems work independently of this slot.
 *
 * In dev mode a minimal axis indicator shows the car's intended origin.
 */
export default function CarSlot() {
  return (
    <group name="car-slot" position={[0, 0, 0]}>
      {/* ─── Insert car model here in Phase 3 ─── */}

      {/* Dev orientation reference — removed in production build */}
      {import.meta.env.DEV && (
        <axesHelper args={[0.5]} />
      )}
    </group>
  )
}
