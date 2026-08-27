import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Network, Package } from 'lucide-react'

type Dependency = {
  name: string
  version: string
}

type DependencyConstellationProps = {
  repositoryName: string
  dependencies: Dependency[]
  onSelect: (name: string) => void
}

export function DependencyConstellation({
  repositoryName,
  dependencies,
  onSelect,
}: DependencyConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dependencies.length === 0) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 7)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const group = new THREE.Group()
    scene.add(group)

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.72, 1),
      new THREE.MeshBasicMaterial({ color: 0xb99552, wireframe: true, transparent: true, opacity: 0.9 }),
    )
    group.add(core)

    const nodes: THREE.Object3D[] = dependencies.map((_, index) => {
      const angle = (index / dependencies.length) * Math.PI * 2
      const radius = 2.1 + (index % 2) * 0.28
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshBasicMaterial({ color: index % 2 === 0 ? 0x7aa2b8 : 0xc47f5a }),
      )
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.58, (index % 3 - 1) * 0.22)
      group.add(node)

      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), node.position]),
        new THREE.LineBasicMaterial({ color: 0x64707a, transparent: true, opacity: 0.45 }),
      )
      group.add(line)
      return node
    })

    const pointer = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      group.rotation.y = pointer.x * 0.08
      group.rotation.x = pointer.y * 0.05
    }
    const handleClick = () => {
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(nodes)[0]
      if (hit) {
        const index = nodes.indexOf(hit.object as THREE.Mesh)
        if (index >= 0) onSelect(dependencies[index].name)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('click', handleClick)

    let frame = 0
    const animate = () => {
      core.rotation.x += 0.002
      core.rotation.y += 0.004
      group.rotation.z += 0.0007
      renderer.render(scene, camera)
      frame = window.requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('click', handleClick)
      group.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose()
          const material = object.material
          if (Array.isArray(material)) material.forEach((item) => item.dispose())
          else material.dispose()
        }
      })
      renderer.dispose()
    }
  }, [dependencies, onSelect])

  return (
    <div className="architecture-stage">
      <canvas ref={canvasRef} className="architecture-stage__canvas" aria-hidden="true" />
      <div className="architecture-stage__label">
        <Network className="size-4 text-amber-400" aria-hidden="true" />
        <span>{repositoryName}</span>
        <span className="text-zinc-600">source</span>
      </div>
      <div className="architecture-stage__legend" aria-hidden="true">
        <span><i className="architecture-stage__dot architecture-stage__dot--core" /> repository</span>
        <span><i className="architecture-stage__dot architecture-stage__dot--dependency" /> dependency</span>
      </div>
      <div className="architecture-stage__list">
        {dependencies.map((dependency) => (
          <button key={dependency.name} type="button" onClick={() => onSelect(dependency.name)}>
            <Package className="size-3.5 text-sky-400" aria-hidden="true" />
            <span>{dependency.name}</span>
            <span className="text-zinc-600">{dependency.version}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
