import gsap from 'gsap'

export function initHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

  tl.from('.nav', { y: -20, opacity: 0, duration: 0.5 })
  tl.from('.hero-eyebrow', { y: 14, opacity: 0, duration: 0.55 }, '-=0.1')
  tl.from(
    '.hero-headline .line',
    { clipPath: 'inset(100% 0 0 0)', y: '100%', stagger: 0.1, duration: 1.0, ease: 'power3.out' },
    '-=0.2'
  )
  tl.from('.hero-sub', { y: 18, opacity: 0, duration: 0.6 }, '-=0.4')
  tl.from('.hero-meta', { y: 12, opacity: 0, duration: 0.5 }, '-=0.35')
  tl.from('.hero-cta', { y: 12, opacity: 0, duration: 0.5 }, '-=0.35')
  tl.from('.countdown-unit', { y: 24, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.2')

  return tl
}
