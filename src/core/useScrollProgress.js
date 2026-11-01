import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * useScrollProgress
 *
 * Returns a ref (not state) that holds the current scroll progress 0→1.
 * Using a ref avoids React re-renders on every scroll event.
 * R3F components consume it inside useFrame; overlay components
 * consume it inside a rAF loop.
 */
export function useScrollProgress() {
  const progressRef = useRef(0)

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progressRef.current = self.progress
      },
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return progressRef
}
