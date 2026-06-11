import * as THREE from 'three'
import gsap from 'gsap'

const ACCENT = 0xff8a3d

/* Evenly-spaced subset of the fibonacci sphere — accent dots sit on the same grid as base dots */
function fibonacciSubset(totalCount, subsetCount, radius) {
  const all = fibonacciSphere(totalCount, radius)
  const step = Math.floor(totalCount / subsetCount)
  const positions = new Float32Array(subsetCount * 3)
  for (let i = 0; i < subsetCount; i++) {
    const src = i * step
    positions[i * 3]     = all[src * 3]
    positions[i * 3 + 1] = all[src * 3 + 1]
    positions[i * 3 + 2] = all[src * 3 + 2]
  }
  return positions
}

/* Fibonacci sphere — even distribution of N points on a unit sphere */
function fibonacciSphere(count, radius) {
  const positions = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    positions[i * 3] = Math.cos(theta) * r * radius
    positions[i * 3 + 1] = y * radius
    positions[i * 3 + 2] = Math.sin(theta) * r * radius
  }
  return positions
}

/* Latitude/longitude graticule as line segments */
function buildGraticule(radius, step = 15, segments = 64) {
  const pts = []
  const d2r = Math.PI / 180
  for (let lat = -75; lat <= 75; lat += step) {
    const r = Math.cos(lat * d2r) * radius
    const y = Math.sin(lat * d2r) * radius
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2
      const b = ((i + 1) / segments) * Math.PI * 2
      pts.push(Math.cos(a) * r, y, Math.sin(a) * r, Math.cos(b) * r, y, Math.sin(b) * r)
    }
  }
  for (let lon = 0; lon < 360; lon += step) {
    const phi = lon * d2r
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI - Math.PI / 2
      const b = ((i + 1) / segments) * Math.PI - Math.PI / 2
      pts.push(
        Math.cos(a) * Math.cos(phi) * radius, Math.sin(a) * radius, Math.cos(a) * Math.sin(phi) * radius,
        Math.cos(b) * Math.cos(phi) * radius, Math.sin(b) * radius, Math.cos(b) * Math.sin(phi) * radius
      )
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
  return geo
}

export function initGlobe({ reduceMotion }) {
  const container = document.querySelector('.globe-canvas-wrap')
  if (!container || !window.WebGLRenderingContext) return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.z = 3.5

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const globe = new THREE.Group()
  globe.rotation.z = 0.2
  scene.add(globe)

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshPhongMaterial({
      color: 0x1a1a18,
      emissive: ACCENT,
      emissiveIntensity: 0.04,
      specular: new THREE.Color(ACCENT).multiplyScalar(0.08),
      shininess: 12,
      transparent: true,
      opacity: 0.92,
    })
  )
  globe.add(sphere)

  const dotsGeo = new THREE.BufferGeometry()
  dotsGeo.setAttribute('position', new THREE.BufferAttribute(fibonacciSphere(3000, 1.002), 3))
  globe.add(
    new THREE.Points(
      dotsGeo,
      new THREE.PointsMaterial({ color: 0xe4e3de, size: 0.012, transparent: true, opacity: 0.6 })
    )
  )

  /* Sparse orange accent dots — two layers (halo + core) for a glow effect */
  const accentGeo = new THREE.BufferGeometry()
  accentGeo.setAttribute('position', new THREE.BufferAttribute(fibonacciSubset(3000, 110, 1.003), 3))
  globe.add(new THREE.Points(accentGeo, new THREE.PointsMaterial({
    color: ACCENT, size: 0.05, transparent: true, opacity: 0.18,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })))
  globe.add(new THREE.Points(accentGeo, new THREE.PointsMaterial({
    color: ACCENT, size: 0.016, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })))

  globe.add(
    new THREE.LineSegments(
      buildGraticule(1.001),
      new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.06 })
    )
  )

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshPhongMaterial({ color: ACCENT, transparent: true, opacity: 0.06, side: THREE.BackSide })
  )
  atmosphere.scale.setScalar(1.03)
  scene.add(atmosphere)

  scene.add(new THREE.AmbientLight(0xffffff, 0.3))
  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(5, 3, 5)
  scene.add(dir)
  const point = new THREE.PointLight(ACCENT, 0.4)
  point.position.set(-3, 3, -2)
  scene.add(point)

  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    renderer.render(scene, camera)
  }
  window.addEventListener('resize', resize)
  resize()

  if (reduceMotion) {
    renderer.domElement.style.opacity = 1
    renderer.render(scene, camera)
    return
  }

  /* Auto-spin accumulates separately from the mouse offset so the
     lerp never fights the constant rotation */
  let baseY = 0
  let targetX = 0
  let targetY = 0
  let offsetX = 0
  let offsetY = 0

  const hero = document.querySelector('.hero')
  const fineMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (fineMouse && hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const my = ((e.clientY - rect.top) / rect.height) * 2 - 1
      targetY = mx * 0.35
      targetX = my * 0.2
    })
    hero.addEventListener('mouseleave', () => {
      targetX = 0
      targetY = 0
    })
  }

  function tick() {
    baseY += 0.0008
    offsetY += (targetY - offsetY) * 0.05
    offsetX += (targetX - offsetX) * 0.05
    globe.rotation.y = baseY + offsetY
    globe.rotation.x = offsetX
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  /* Entry */
  globe.scale.setScalar(0.6)
  gsap.to(globe.scale, { x: 1, y: 1, z: 1, duration: 1.8, ease: 'power3.out', delay: 0.4 })
  gsap.to(renderer.domElement, { opacity: 1, duration: 1.2, delay: 0.3 })

  /* Idle float */
  gsap.to('.globe-float', { y: -8, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' })
}
