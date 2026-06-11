import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reveal = (targets, vars, trigger) =>
  gsap.from(targets, {
    scrollTrigger: { trigger: trigger || targets, start: 'top 80%' },
    duration: 0.85,
    ease: 'power2.out',
    ...vars,
  })

export function initScrollReveal() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    reveal(el, { y: 50, opacity: 0 })
  })

  document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
    reveal(group.children, { y: 50, opacity: 0, stagger: 0.1 }, group)
  })

  document.querySelectorAll('[data-eyebrow]').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      clipPath: 'inset(0 100% 0 0)',
      duration: 0.7,
      ease: 'power2.out',
    })
  })

  const speakers = document.querySelectorAll('.speaker-card')
  if (speakers.length) {
    reveal(speakers, { y: 40, opacity: 0, stagger: 0.08 }, '.speakers-grid')
  }

  const agendaRows = document.querySelectorAll('[data-agenda]')
  agendaRows.forEach((row) => {
    reveal(row, { x: -30, opacity: 0, duration: 0.7, stagger: 0.07 })
  })

  const logos = document.querySelectorAll('.logo-box')
  if (logos.length) {
    reveal(logos, { opacity: 0, stagger: 0.04 }, '.logo-grid')
  }

  const faqItems = document.querySelectorAll('[data-faq]')
  if (faqItems.length) {
    reveal(faqItems, { y: 20, opacity: 0, stagger: 0.06 }, '.faq-list')
  }
}
