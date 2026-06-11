import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initParallax() {
  gsap.to('.hero-headline', {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })

  gsap.to('.hero-globe', {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })

  gsap.to('.venue-img', {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: { trigger: '.venue-hero', start: 'top bottom', end: 'bottom top', scrub: true },
  })

  gsap.to('.cta-band .container', {
    yPercent: -5,
    ease: 'none',
    scrollTrigger: { trigger: '.cta-band', start: 'top bottom', end: 'bottom top', scrub: true },
  })
}
