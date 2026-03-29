import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Trail } from '@react-three/drei'
import * as THREE from 'three'

interface OrbitRingProps {
  radius: number
}

function OrbitRing({ radius }: OrbitRingProps) {
  return (
    <mesh rotation={[0, 0, 0]}>
      <torusGeometry args={[radius, 0.015, 8, 128]} />
      <meshBasicMaterial color="#333355" transparent opacity={0.5} />
    </mesh>
  )
}

export default function Scene() {
  const planetRefs = [
    useRef<THREE.Mesh>(null!), // mercury
    useRef<THREE.Mesh>(null!), // venus
    useRef<THREE.Mesh>(null!), // earth
    useRef<THREE.Mesh>(null!), // mars
    useRef<THREE.Mesh>(null!), // jupiter
    useRef<THREE.Mesh>(null!), // saturn
    useRef<THREE.Mesh>(null!), // uranus
    useRef<THREE.Mesh>(null!), // neptune
    useRef<THREE.Mesh>(null!), // pluto
  ];
  const baseDistance = 7;
  const planetProps = [
    { color: '#aaaaaa', size: 0.6, distance: baseDistance * 0.39, angularVelocity: 0.4*365/88 }, // mercury
    { color: '#ffaa66', size: 0.55, distance: baseDistance * 0.72, angularVelocity: 0.4*365/225 }, // venus
    { color: '#2266cc', size: 0.6, distance: baseDistance, angularVelocity: 0.4 }, // earth
    { color: '#cc4422', size: 0.5, distance: baseDistance * 1.52, angularVelocity: 0.4*365/687 }, // mars
    { color: '#ffaa88', size: 1.2, distance: baseDistance * 5.2, angularVelocity: 0.4*365/4333 }, // jupiter
    { color: '#ddaa77', size: 1, distance: baseDistance * 9.58, angularVelocity: 0.4*365/10759 }, // saturn
    { color: '#66aaff', size: 0.9, distance: baseDistance * 19.2, angularVelocity: 0.4*365/30687 }, // uranus
    { color: '#4477ff', size: 0.85, distance: baseDistance * 30.05, angularVelocity: 0.4*365/60190 }, // neptune
    { color: '#aa88ff', size: 0.4, distance: baseDistance * 39.48, angularVelocity: 0.4*365/90560 }, // pluto
  ];
  const earthRef = planetRefs[2];
  const moonRef = useRef<THREE.Mesh>(null!)
  const sunRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (sunRef.current) {
      sunRef.current.rotation.y = t * 0.1
    }

    planetRefs.forEach((ref, i) => {
      if (ref.current) {
        const distance = planetProps[i].distance;
        const angularVelocity = planetProps[i].angularVelocity || 0.4;
        ref.current.position.x = Math.cos(t * angularVelocity) * distance;
        ref.current.position.z = Math.sin(t * angularVelocity) * distance;
        ref.current.rotation.y = t * 1.5
      }
    })

    if (moonRef.current && earthRef.current) {
      moonRef.current.position.x = earthRef.current.position.x + Math.cos(t * 1.8) * 1.8
      moonRef.current.position.z = earthRef.current.position.z + Math.sin(t * 1.8) * 1.8
    }
  })

  return (
    <>
      <color attach="background" args={['#040410']} />
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 0, 0]} intensity={15} color="#fff8e0" distance={50} decay={0.5} />

      <Stars radius={80} depth={50} count={4000} factor={4} fade speed={0.5} />
      <OrbitControls enablePan={true} minDistance={5} maxDistance={40} />

      {/* Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[2, 40, 40]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ff6600"
          emissiveIntensity={1.2}
          roughness={0.8}
        />
      </mesh>

      {/* Sun glow */}
      <mesh>
        <sphereGeometry args={[2.4, 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.08} />
      </mesh>

      {planetProps.map((props) => (
        <OrbitRing radius={props.distance} />
      ))}
      {planetProps.map((props, i) => (
            <Trail
              width={0.4}
              length={8}
              color={props.color}
              attenuation={(t) => t * t}
              target={planetRefs[i] as React.MutableRefObject<THREE.Object3D>}
            >
              <mesh ref={planetRefs[i]} position={[props.distance, 0, 0]}>
                <sphereGeometry args={[props.size, 32, 32]} />
                <meshStandardMaterial color={props.color} roughness={0.7} metalness={0.1} />
              </mesh>
            </Trail>
      ))}

      {/* Moon */}
      <mesh ref={moonRef} position={[planetProps[2].distance + 1.8, 0, 0]}>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.9} />
      </mesh>
    </>
  )
}
