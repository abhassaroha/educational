import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

const WAVE_POINTS = 200
const WAVE_WIDTH = 20
const HARMONICS = [1, 2, 3]

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff']
const LABELS = ['Fundamental (n=1)', '2nd Harmonic (n=2)', '3rd Harmonic (n=3)', 'Sum (superposition)']

function buildPoints(count: number): THREE.Vector3[] {
  return Array.from({ length: count }, (_, i) => {
    const x = (i / (count - 1)) * WAVE_WIDTH - WAVE_WIDTH / 2
    return new THREE.Vector3(x, 0, 0)
  })
}

interface WaveLineProps {
  yOffset: number
  harmonicIndex: number
  color: string
  label: string
  clock: { current: number }
  showSum: boolean
}

function WaveLine({ yOffset, harmonicIndex, color, label, clock, showSum }: WaveLineProps) {
  const [points, setPoints] = useState<THREE.Vector3[]>(buildPoints(WAVE_POINTS))

  useFrame(() => {
    const t = clock.current
    const pts = points;

    for (let i = 0; i < WAVE_POINTS; i++) {
      const x = pts[i].x
      let y: number

      if (showSum) {
        y = HARMONICS.reduce((sum, n) => {
          const amplitude = 1 / n
          const k = (n * Math.PI) / (WAVE_WIDTH / 2)
          return sum + amplitude * Math.sin(k * x - n * t * 0.8)
        }, 0)
        y *= 0.7
      } else {
        const n = HARMONICS[harmonicIndex]
        const amplitude = 1
        const k = (n * Math.PI) / (WAVE_WIDTH / 2)
        y = amplitude * Math.sin(k * x - n * t * 0.8)
      }
      pts[i].y = y + yOffset
    }
    setPoints([...pts]);
  })

  const initialPositions = useMemo(() => {
    return Float32Array.from(
      buildPoints(WAVE_POINTS).flatMap((p) => [p.x, p.y + yOffset, 0])
    )
  }, [yOffset])

  return (
    <group>
      <Line points={points} color={color} linewidth={2}  />
      <Text
        position={[-WAVE_WIDTH / 2 - 1.5, yOffset, 0]}
        fontSize={0.35}
        color={color}
        anchorX="right"
        anchorY="middle"
      >
        {label}
      </Text>
      {/* Baseline */}
      <Line color="#222240" points={[new THREE.Vector3(-WAVE_WIDTH / 2, yOffset, 0), new THREE.Vector3(WAVE_WIDTH / 2, yOffset, 0)]} lineWidth={1} />
    </group>
  )
}

export default function Scene() {
  const clockRef = useRef<number>(0)

  useFrame(({ clock }) => {
    clockRef.current = clock.getElapsedTime()
  })

  const yOffsets = [5, 2, -1, -4.5]

  return (
    <>
      <color attach="background" args={['#080815']} />
      <ambientLight intensity={0.6} />
      <OrbitControls enablePan={true} minDistance={5} maxDistance={40} />

      {HARMONICS.map((_, i) => (
        <WaveLine
          key={i}
          yOffset={yOffsets[i]}
          harmonicIndex={i}
          color={COLORS[i]}
          label={LABELS[i]}
          clock={clockRef}
          showSum={false}
        />
      ))}

      <WaveLine
        key="sum"
        yOffset={yOffsets[3]}
        harmonicIndex={0}
        color={COLORS[3]}
        label={LABELS[3]}
        clock={clockRef}
        showSum={true}
      />

      <Text
        position={[0, 7.5, 0]}
        fontSize={0.55}
        color="#9090cc"
        anchorX="center"
      >
        Standing Waves & Harmonics
      </Text>

      <Text
        position={[0, -6.8, 0]}
        fontSize={0.35}
        color="#555577"
        anchorX="center"
      >
        y = A·sin(nπx/L − nωt)   — bottom row shows superposition
      </Text>
    </>
  )
}
