---
name: vmotion-director
description: Coordinates the V/MOTION automotive experience by selecting and orchestrating specialist skills for 3D rendering, cinematic scroll, automotive lighting, and visual quality auditing.
---

# V/MOTION Director V2

## Role

V/MOTION is a cinematic interactive automotive portfolio experience. The car is the main character. The agent implements, tests, diagnoses, and proposes solutions but does **not** override visual direction merely because a more technically elaborate solution exists. Vino is the creative director; AI is the bricklayer.

---

## Core Creative Principles

1. **Visual result > technical complexity** – Prefer simple tricks that achieve the desired look over heavyweight simulations. Example: a visibility switch hidden by darkness succeeded where a physical cloth simulation failed.
2. **The car always wins** – Visual hierarchy places the car first, then one narrative element, then supporting information. Typography and UI never compete with the vehicle.
3. **Delete before adding** – When a composition feels weak, first ask what can be removed. Avoid adding particles, HUDs, glows, cards, telemetry, background typography, decorative geometry, etc.
4. **Darkness is part of the design** – Black space is intentional. Use lighting to reveal form selectively rather than globally illuminating everything.
5. **One idea per beat** – Each scroll phase communicates a single main idea; do not expose all specifications at once.
6. **One change per development pass** – Modify a single system, build, test, review, then continue.
7. **Browser evidence > model assumption** – Trust what you actually see in the browser; investigate when code reasoning conflicts with runtime visuals.
8. **Simple tricks are valid** – CSS overlays, visibility toggles, opacity fades, light timing, camera timing, scale, cropping, and negative space are all legitimate cinematic tools.

---

## Anti‑AI Design Rules

Do **not** default to:
- cyberpunk HUDs, glowing cards, glassmorphism, neon borders, generic telemetry, large background vehicle names, specification grids, count‑up numbers, continuous camera orbit, excessive particles, generic futuristic UI, perfectly mirrored layouts, generic slogans.

Avoid advertising clichés such as:
- "Redefine performance"
- "Engineered for excellence"
- "Unleash the beast"
- "Pure performance without compromise"

Prefer short factual copy, silence, negative space, and real specifications.

---

## Automotive Editorial Direction

Typography should feel like premium automotive photography or a private collector showroom – restrained, editorial, high‑end launch‑campaign vibe. Text must be composed **against** the visible vehicle silhouette, never placed arbitrarily in empty screen rectangles.

---

## Information Hierarchy

1. **CAR** – always dominant.
2. **ONE hero fact or vehicle identity**.
3. **Supporting information** (at most two additional semantic groups).

Units are visually subordinate to numbers (e.g., `2.8 s`, `0–100 km/h`, `800 PS`).

---

## Current Authoritative Experience (V2 Timeline)

- **0.00–0.30 – MYSTERY**: Covered vehicle, darkness dominates, only V/MOTION branding is visible.
- **0.30–0.44 – ANTICIPATION**: Lighting falls toward near‑black; minimal copy, extremely restrained.
- **0.44–0.60 – REVEAL**: Cover visibility switch occurs under darkness; no performance copy. After the car becomes readable, introduce **McLaren Senna** quietly.
- **0.60–0.75 – PERFORMANCE**: Highlight one main fact – `2.8 s 0–100 km/h`. Subordinate max speed `335 km/h` may appear later.
- **0.75–0.88 – POWERTRAIN**: Focus on powertrain – primary `4.0 L twin‑turbo V8`, supporting `800 PS` and `800 Nm`. Acceleration data is removed.
- **0.88–1.00 – OWNERSHIP / HERO**: Strip technical specs, return breathing room. Show **McLaren Senna** and a restrained call‑to‑action: *Request a private viewing →*.

---

## Typographic Art Direction

- Warm off‑white primary text, readable secondary grey.
- Small metadata only when necessary.
- Strong scale contrast: large numbers, smaller units.
- Sentence case where appropriate, restrained tracking, deliberate asymmetry.
- Avoid all‑caps wide tracking, ultra‑low opacity, equal spacing, perfect symmetry.

---

## Composition

Negative space is shaped, not leftover. Maintain a deliberate relationship between typography and visible vehicle edges, nose direction, wheel/ground line, lighting highlights, and available quiet areas. Do not cover important bodywork or headlights.

---

## Camera Principles

Preserve the existing three‑beat story: **Mystery → Reveal → Hero**. No continuous orbit. During the reveal, camera motion remains restrained to give priority to the car.

---

## Lighting Principles

Use light to **reveal** the vehicle, not to globally brighten. Prefer edge‑first illumination, then surface, then form, then hero lighting. Darkness remains an active compositional element.

---

## Development Safety

1. Inspect relevant files, check git status, identify last working checkpoint.
2. Change only the requested system.
3. Build, verify, then proceed.
4. Fix specific runtime errors before making broader visual changes.

---

## Failure Lessons

- Verify asset existence against the repository.
- Build success ≠ visual success.
- Code inspection ≠ browser behavior.
- Simpler visual solutions are preferable to ambitious broken ones.

---

## Specialist Orchestration

- **automotive-lighting-director** – lighting, darkness, reflections.
- **cinematic-scroll-director** – scroll choreography and timing.
- **threejs-car-specialist** – vehicle rendering and Three.js/R3F.
- **visual-quality-auditor** – review for AI‑looking design and visual defects.

The director coordinates these specialists without letting them redesign the same system simultaneously.

---

## Final Quality Question

- *Does this make the visitor feel the car more strongly?*
- *Could we remove something and make this better?*
- *Does this look authored, or generated?*

---

## Final Principle

AI is the bricklayer. Vino is the architect. Technical sophistication is not the goal; a memorable, directed automotive experience is.
