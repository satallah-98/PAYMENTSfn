import gsap from 'gsap'

/* Nov 18 2026 09:00 New York — EST (UTC-5) applies; DST ends Nov 1 2026 */
const TARGET = new Date('2026-11-18T09:00:00-05:00')

function remaining() {
  const diff = Math.max(0, TARGET.getTime() - Date.now())
  const totalMinutes = Math.floor(diff / 60000)
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor(totalMinutes / 60) % 24,
    minutes: totalMinutes % 60,
    over: diff === 0,
  }
}

export function initCountdown({ reduceMotion }) {
  const root = document.querySelector('[data-countdown]')
  if (!root) return
  const els = {
    days: root.querySelector('[data-count="days"]'),
    hours: root.querySelector('[data-count="hours"]'),
    minutes: root.querySelector('[data-count="minutes"]'),
  }

  function render() {
    const t = remaining()
    if (t.over) {
      els.days.textContent = '—'
      els.hours.textContent = '—'
      els.minutes.textContent = '—'
      root.setAttribute('aria-label', 'PAYMENTSfn is live now')
      return
    }
    els.days.textContent = t.days
    els.hours.textContent = String(t.hours).padStart(2, '0')
    els.minutes.textContent = String(t.minutes).padStart(2, '0')
  }

  if (reduceMotion) {
    render()
  } else {
    /* Roll up from 0 once, timed to land after the hero timeline reaches the strip */
    const t = remaining()
    Object.entries({ days: t.days, hours: t.hours, minutes: t.minutes }).forEach(([key, value]) => {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: value,
        duration: 1.8,
        delay: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          const n = Math.round(obj.val)
          els[key].textContent = key === 'days' ? n : String(n).padStart(2, '0')
        },
        onComplete: render,
      })
    })
  }

  setInterval(render, 60000)
}
