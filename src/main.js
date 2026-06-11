import './style.css'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initCountdown } from './modules/countdown.js'
import { initHero } from './gsap/hero.js'
import { initScrollReveal } from './gsap/scrollReveal.js'
import { initParallax } from './gsap/parallax.js'

gsap.registerPlugin(ScrollTrigger)

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ── Smooth scroll: Lenis drives native window scroll, so no scrollerProxy ── */
let lenis = null
if (!reduceMotion) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

/* ── Anchor links route through Lenis (modal triggers handled separately) ── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href')
    if (id.length < 2 || id === '#register') return
    const target = document.querySelector(id)
    if (!target) return
    e.preventDefault()
    if (lenis) lenis.scrollTo(target, { offset: -72 })
    else target.scrollIntoView()
  })
})

/* ── Nav scrolled state ── */
const nav = document.querySelector('.nav')
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60)
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

/* ── FAQ accordion (GSAP height tween, native buttons for keyboard) ── */
document.querySelectorAll('[data-faq]').forEach((item) => {
  const btn = item.querySelector('.faq-q')
  const panel = item.querySelector('.faq-a')
  gsap.set(panel, { height: 0, overflow: 'hidden' })
  btn.addEventListener('click', () => {
    const open = item.classList.toggle('open')
    btn.setAttribute('aria-expanded', String(open))
    gsap.to(panel, {
      height: open ? 'auto' : 0,
      duration: reduceMotion ? 0 : 0.4,
      ease: 'power2.out',
    })
  })
})

/* ── HubSpot registration modal ── */
const modal = document.getElementById('register-modal')
let hubspotLoaded = false

function loadHubSpot() {
  if (hubspotLoaded) return
  hubspotLoaded = true
  const script = document.createElement('script')
  script.src = 'https://js.hsforms.net/forms/v2.js'
  script.onload = () => {
    window.hbspt.forms.create({
      portalId: '50525040',
      formId: '65b04ecd-1693-452d-a2c4-47b44bba9677',
      target: '#hubspot-form-target',
      cssRequired: '',
    })
  }
  document.head.appendChild(script)
}

function openModal() {
  modal.hidden = false
  requestAnimationFrame(() => modal.classList.add('open'))
  if (lenis) lenis.stop()
  document.body.style.overflow = 'hidden'
  loadHubSpot()
  modal.querySelector('.modal-close').focus()
}

function closeModal() {
  modal.classList.remove('open')
  modal.addEventListener('transitionend', () => { modal.hidden = true }, { once: true })
  if (lenis) lenis.start()
  document.body.style.overflow = ''
}

document.querySelectorAll('[href="#register"], [data-modal-trigger]').forEach((t) =>
  t.addEventListener('click', (e) => { e.preventDefault(); openModal() })
)
modal.querySelector('.modal-close').addEventListener('click', closeModal)
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal() })
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal() })

/* ── Modules ── */
/* Three.js is the heaviest dependency — load it as its own chunk so the
   page renders without waiting on it */
import('./modules/globe.js').then(({ initGlobe }) => initGlobe({ reduceMotion }))
initCountdown({ reduceMotion })

if (!reduceMotion) {
  initHero()
  initScrollReveal()
  initParallax()
} else {
  document
    .querySelectorAll('[data-reveal], [data-reveal-stagger], [data-eyebrow], [data-agenda], .speaker-card, .logo-box, [data-faq]')
    .forEach((el) => { el.style.opacity = 1 })
}
