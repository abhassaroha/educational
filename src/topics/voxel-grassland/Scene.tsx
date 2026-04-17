import React, { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { PointerLockControls as PLCImpl } from 'three-stdlib'
import { Cmd, ScratchPad } from './ScratchPad'
import { Voxel, VoxelMesh, VoxelType } from './VoxelMesh'

// ─── Terrain generation ────────────────────────────────────────────────────

const WORLD_SIZE = 48

function hash(x: number, z: number): number {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function smoothNoise(x: number, z: number): number {
  const ix = Math.floor(x), iz = Math.floor(z)
  const fx = x - ix, fz = z - iz
  const ux = fx * fx * (3 - 2 * fx)
  const uz = fz * fz * (3 - 2 * fz)
  return (
    hash(ix,     iz    ) * (1 - ux) * (1 - uz) +
    hash(ix + 1, iz    ) * ux       * (1 - uz) +
    hash(ix,     iz + 1) * (1 - ux) * uz       +
    hash(ix + 1, iz + 1) * ux       * uz
  )
}

function terrainHeight(wx: number, wz: number): number {
  const ox = wx + 200, oz = wz + 200
  return Math.round(
    smoothNoise(ox * 0.05, oz * 0.05) * 6 +
    smoothNoise(ox * 0.12, oz * 0.12) * 2 +
    smoothNoise(ox * 0.30, oz * 0.30) * 0.5
  )
}

// ─── Voxel data ────────────────────────────────────────────────────────────


function generateWorld(): Voxel[] {
  const voxels: Voxel[] = []
  const half = WORLD_SIZE / 2

  for (let x = -half; x < half; x++) {
    for (let z = -half; z < half; z++) {
      const topY = terrainHeight(x, z)

      voxels.push({ x, y: topY,     z, type: 'grass' })
      for (let y = topY - 1; y >= topY - 3; y--) voxels.push({ x, y, z, type: 'dirt'  })
      for (let y = topY - 4; y >= -3;       y--) voxels.push({ x, y, z, type: 'stone' })

      const r = hash(x * 3.1 + 7, z * 5.7 + 13)
      if      (r < 0.04) voxels.push({ x, y: topY + 1, z, type: 'flower_red'    })
      else if (r < 0.08) voxels.push({ x, y: topY + 1, z, type: 'flower_yellow' })
      else if (r < 0.20) voxels.push({ x, y: topY + 1, z, type: 'tall_grass'    })
    }
  }
  return voxels
}




// ─── First-person controller ───────────────────────────────────────────────

const MOVE_SPEED   = 6
const GRAVITY      = -22
const JUMP_VEL     = 8
const PLAYER_H     = 1.7

interface ActiveMove {
  startX: number; startZ: number
  targetX: number; targetZ: number
  dist: number
  elapsed: number
}

function FirstPersonController({
  heightMap,
  cmdQueue,
}: {
  heightMap: Map<string, number>
  cmdQueue: React.MutableRefObject<Cmd[]>
}) {
  const { camera } = useThree()
  const keys       = useRef<Set<string>>(new Set())
  const velY       = useRef(0)
  const ready      = useRef(false)
  const activeMove = useRef<ActiveMove | null>(null)

  useEffect(() => {
    const spawnH = terrainHeight(0, 0)
    camera.position.set(0.5, spawnH + PLAYER_H + 1, 0.5)
    ready.current = true

    const down = (e: KeyboardEvent) => { 
      keys.current.add(e.code); 
      if (e.code === 'Space') {
        e.preventDefault() 
      }
    }
    const up   = (e: KeyboardEvent) => keys.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => { 
      window.removeEventListener('keydown', down); 
      window.removeEventListener('keyup', up) 
    }
  }, [camera])

  useFrame((_, delta) => {
    if (!ready.current) return
    const dt  = Math.min(delta, 0.05)
    const pos = camera.position

    // Ground height under player
    const gx = Math.round(pos.x - 0.5)
    const gz = Math.round(pos.z - 0.5)
    let groundY = -10
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++) {
        const h = heightMap.get(`${gx + dx},${gz + dz}`) ?? -10
        if (h > groundY) groundY = h
      }
    const floorY = groundY + 1

    const foot = pos.y - PLAYER_H
    if (foot <= floorY) {
      pos.y = floorY + PLAYER_H
      velY.current = 0
      if (keys.current.has('Space')) velY.current = JUMP_VEL
    } else {
      velY.current += GRAVITY * dt
    }
    pos.y += velY.current * dt

    // ── Dequeue and start next scripted command ──
    if (!activeMove.current && cmdQueue.current.length > 0) {
      const cmd = cmdQueue.current.shift()!

      if (cmd.dir === 'J') {
        // Apply jump velocity (height ≈ v²/2g, so v = sqrt(2g*h))
        const h = cmd.dist
        velY.current = Math.sqrt(2 * Math.abs(GRAVITY) * h)
      } else {
        const fwd = new THREE.Vector3()
        camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize()
        const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0))

        const dir = new THREE.Vector3()
        if (cmd.dir === 'F') dir.copy(fwd)
        else if (cmd.dir === 'B') dir.copy(fwd).negate()
        else if (cmd.dir === 'R') dir.copy(right)
        else if (cmd.dir === 'L') dir.copy(right).negate()

        const edge = WORLD_SIZE / 2 - 0.5
        activeMove.current = {
          startX:  pos.x,
          startZ:  pos.z,
          targetX: THREE.MathUtils.clamp(pos.x + dir.x * cmd.dist, -edge, edge),
          targetZ: THREE.MathUtils.clamp(pos.z + dir.z * cmd.dist, -edge, edge),
          dist:    cmd.dist,
          elapsed: 0,
        }
      }
    }

    // ── Animate active scripted move ──
    if (activeMove.current) {
      const ANIM_SPEED = 7 // units/sec
      activeMove.current.elapsed += dt
      const t = Math.min(activeMove.current.elapsed * ANIM_SPEED / activeMove.current.dist, 1)
      const eased = 1 - (1 - t) * (1 - t)  // ease-out quad

      pos.x = THREE.MathUtils.lerp(activeMove.current.startX, activeMove.current.targetX, eased)
      pos.z = THREE.MathUtils.lerp(activeMove.current.startZ, activeMove.current.targetZ, eased)
      if (t >= 1) activeMove.current = null
      return // skip WASD during animation
    }

    // ── WASD movement ──
    const fwd = new THREE.Vector3()
    camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize()
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0))

    const move = new THREE.Vector3()
    if (keys.current.has('KeyW') || keys.current.has('ArrowUp'))    move.addScaledVector(fwd,   1)
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown'))  move.addScaledVector(fwd,  -1)
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft'))  move.addScaledVector(right,-1)
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) move.addScaledVector(right, 1)
    if (move.lengthSq() > 0) move.normalize()

    pos.x += move.x * MOVE_SPEED * dt
    pos.z += move.z * MOVE_SPEED * dt

    const edge = WORLD_SIZE / 2 - 0.5
    pos.x = THREE.MathUtils.clamp(pos.x, -edge, edge)
    pos.z = THREE.MathUtils.clamp(pos.z, -edge, edge)
  })

  return null
}

// ─── HUD overlay ───────────────────────────────────────────────────────────

function HUD({ locked }: { locked: boolean }) {
  const baseStyle: React.CSSProperties = {
    padding: '16px 14px',
    fontFamily: 'monospace',
    color: '#d4f0d4',
    fontSize: 13,
    borderBottom: '1px solid rgba(80,160,80,0.25)',
  }

  if (locked) {
    return (
      <div style={baseStyle}>
        <div style={{ fontSize: 11, letterSpacing: 1, color: '#7ec87e', textTransform: 'uppercase', marginBottom: 10 }}>Controls</div>
        <div style={{ lineHeight: 2, color: 'rgba(200,240,200,0.8)', fontSize: 12 }}>
          <div><strong>WASD / Arrows</strong> — move</div>
          <div><strong>Mouse</strong> — look</div>
          <div><strong>Space</strong> — jump</div>
          <div><strong>Esc</strong> — release mouse</div>
        </div>
      </div>
    )
  }
  return (
    <div style={{ ...baseStyle, lineHeight: 2 }}>
      <div style={{ fontSize: 16, marginBottom: 8 }}>🌿 Voxel Grassland</div>
      <div style={{ fontSize: 12, color: 'rgba(200,240,200,0.8)' }}>
        <div><strong>Click the world</strong> to lock mouse</div>
        <div><strong>WASD / Arrows</strong> — move</div>
        <div><strong>Mouse</strong> — look</div>
        <div><strong>Space</strong> — jump</div>
        <div><strong>Esc</strong> — release mouse</div>
      </div>
    </div>
  )
}

// ─── Scene ─────────────────────────────────────────────────────────────────

const VOXEL_TYPES: VoxelType[] = ['stone', 'dirt', 'grass', 'tall_grass', 'flower_red', 'flower_yellow']

export function Scene() {
  const controlsRef = useRef<PLCImpl>(null!)
  const [locked, setLocked] = useState(false)
  const cmdQueue = useRef<Cmd[]>([])

  const voxels = useMemo(() => generateWorld(), [])

  const heightMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const v of voxels) {
      const k = `${v.x},${v.z}`
      if ((m.get(k) ?? -Infinity) < v.y) m.set(k, v.y)
    }
    return m
  }, [voxels])

  return (
    <>
      <Html fullscreen>
        {/* Left sidebar: 20% width, full height */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: '20%',
          background: 'rgba(10, 16, 10, 0.92)',
          borderRight: '1px solid rgba(80,160,80,0.3)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
          userSelect: 'none',
          fontFamily: 'monospace',
          overflowY: 'auto',
        }}>
          <HUD locked={locked} />
          <ScratchPad onSubmit={cmds => { cmdQueue.current.push(...cmds) }} />
        </div>

        {/* Crosshair centered in the right 80% pane when locked */}
        {locked && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 'calc(20% + 40%)',
            transform: 'translate(-50%, -50%)',
            width: 8, height: 8, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 0 0 1.5px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }} />
        )}
      </Html>
      <>
        <color attach="background" args={['#87ceeb']} />
        <fog attach="fog" args={['#87ceeb', 18, 52]} />

        <ambientLight intensity={0.65} />
        <directionalLight position={[30, 50, 20]} intensity={1.2} castShadow />

        <PointerLockControls
          ref={controlsRef}
          onLock={()   => setLocked(true)}
          onUnlock={()  => setLocked(false)}
        />

        <FirstPersonController heightMap={heightMap} cmdQueue={cmdQueue} />

        {VOXEL_TYPES.map(t => <VoxelMesh key={t} voxels={voxels} type={t} />)}

      </>
    </>
  )
}
