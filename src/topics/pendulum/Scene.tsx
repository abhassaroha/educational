import { Line, OrbitControls, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

const G = 9.81
const TIME_SCALE = 0.6

interface PendulumProps {
  pivotX: number
  length: number
  color: string
  label: string
  initialAngle?: number
}

interface PendulumState {
  angle: number
  angularVel: number
}

interface PendulumConfig {
  pivotX: number
  length: number
  color: string
  label: string
  initialAngle: number
}

function Pendulum({ pivotX, length, color, label, initialAngle = Math.PI / 4 }: PendulumProps) {
  const bobRef = useRef<THREE.Mesh>(null!)
  const initialBobX = pivotX + Math.sin(initialAngle) * length
  const initialBobY = -Math.cos(initialAngle) * length
  const [points, setPoints] = useState([new THREE.Vector2(pivotX, 0), new THREE.Vector2(initialBobX, initialBobY)]);
  const stateRef = useRef<PendulumState>({ angle: initialAngle, angularVel: 0 })
  const prevTime = useRef<number | null>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (prevTime.current === null) {
      prevTime.current = t
      return
    }

    const rawDt = Math.min(t - prevTime.current, 0.05)
    prevTime.current = t
    const dt = rawDt * TIME_SCALE

    const state = stateRef.current
    const angularAcc = -(G / length) * Math.sin(state.angle)
    state.angularVel += angularAcc * dt
    state.angularVel *= 0.9995
    state.angle += state.angularVel * dt

    const bobX = pivotX + Math.sin(state.angle) * length
    const bobY = -Math.cos(state.angle) * length

    if (bobRef.current) {
      bobRef.current.position.set(bobX, bobY, 0)
    }
    (points[0] as THREE.Vector2).set(pivotX, 0);
    (points[1] as THREE.Vector2).set(bobX, bobY);
    setPoints([...points]);
  })


  return (
    <group>
      {/* Pivot point */}
      <mesh position={[pivotX, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#888" />
      </mesh>

      {/* Rod */}
      <Line points={points} color={color} lineWidth={2}/>

      {/* Bob */}
      <mesh ref={bobRef} position={[initialBobX, initialBobY, 0]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>

      <Text
        position={[pivotX, 0.5, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="bottom"
      >
        {label}
      </Text>
    </group>
  )
}

const PENDULUMS: PendulumConfig[] = [
  { pivotX: -6, length: 2,   color: '#ff6b6b', label: 'L = 2 m',   initialAngle: Math.PI / 5 },
  { pivotX: -2, length: 3.5, color: '#ffd93d', label: 'L = 3.5 m', initialAngle: Math.PI / 5 },
  { pivotX:  2, length: 5,   color: '#6bcb77', label: 'L = 5 m',   initialAngle: Math.PI / 5 },
  { pivotX:  6, length: 7,   color: '#4d96ff', label: 'L = 7 m',   initialAngle: Math.PI / 5 },
]

export default function Scene() {
  return (
    <>
      <color attach="background" args={['#0a0a18']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <OrbitControls enablePan={true} minDistance={5} maxDistance={30} />

      {/* Ceiling bar */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[16, 0.2, 0.3]} />
        <meshStandardMaterial color="#444466" />
      </mesh>

      {PENDULUMS.map((p) => (
        <Pendulum key={p.pivotX} {...p} />
      ))}

      <Text
        position={[0, -9, 0]}
        fontSize={0.4}
        color="#666688"
        anchorX="center"
      >
        T = 2π √(L/g)  — longer pendulums swing slower
      </Text>
    </>
  )
}
