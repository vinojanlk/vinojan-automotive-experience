---
name: cinematic-scroll-director
description: Designs cinematic scroll-driven storytelling for the V/MOTION 3D automotive portfolio experience.
---

# Cinematic Scroll Director

## Mission

Transform scrolling into camera direction.

This project must NOT feel like scrolling through ordinary website sections.

The visitor should feel like scrolling through a cinematic automotive film.

## Core Principle

SCROLL = TIME.

The user's vertical scroll position controls the progress of the experience.

Scrolling forward progresses the film.

Scrolling backward should naturally reverse the experience.

Stopping scroll should stop or settle the controlled sequence.

## Storytelling Rules

Prefer:

- long cinematic transitions
- pinned scenes
- camera movement
- object movement
- light changes
- controlled reveals
- typography appearing at meaningful moments
- transitions between wide shots and extreme close-ups

Avoid:

- card grids
- normal content sections
- excessive text
- random entrance animations
- animation without narrative purpose
- constant movement that ignores scroll position

## Preferred Story Arc

### 0-10% — Mystery

Begin in darkness.

Only tiny reflections reveal that an object exists.

Do not immediately reveal the whole car.

### 10-20% — Identity

Reveal the front silhouette.

Camera approaches slowly.

Allow the visitor to understand that the object is a vehicle.

### 20-30% — Awakening

Activate headlights.

Increase reflections.

Move the camera around the front quarter.

### 30-45% — Form

Camera travels across:

- hood
- body line
- side profile
- aerodynamic surfaces

Use minimal typography.

### 45-55% — Precision

Move into an extreme close-up.

Possible subjects:

- wheel
- brake
- headlight
- carbon surface
- body detail

### 55-70% — Engineering

Reveal technical complexity.

Possible experiments:

- exploded components
- transparent materials
- wireframe
- X-ray
- mechanical visualization

### 70-82% — Interior

Camera transitions toward the cockpit.

Interior lighting activates.

Present a different atmosphere from the exterior sequence.

### 82-92% — Transformation

Change the environment or lighting.

Make the visitor feel that the experience is reaching its climax.

### 92-100% — Hero Reveal

Camera pulls backward.

Reveal the complete vehicle.

Finish with a strong final composition.

## Typography

Text should support the image, not compete with it.

Prefer extremely short phrases:

"Presence."

"Sculpted by motion."

"Precision."

"Inside the machine."

"Built to be felt."

Do not write marketing paragraphs during cinematic sequences.

## Camera Motion

Camera movement should feel physically intentional.

Avoid:

- random rotation
- uncontrolled orbiting
- excessive shake
- constant zoom
- motion that feels like a 3D demo

Think like a cinematographer.

Every shot should have:

1. subject
2. framing
3. purpose
4. transition
5. destination

## Implementation Thinking

When useful, coordinate scroll progress with:

- GSAP timelines
- ScrollTrigger
- React Three Fiber camera state
- Three.js scene objects
- lights
- materials
- post-processing

Do not choose a technology merely because it looks technically impressive.

## Final Test

Ask:

"If I removed all text, would scrolling still tell a story?"

If NO, improve the visual storytelling.
