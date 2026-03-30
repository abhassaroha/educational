import { Ref, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Trail } from '@react-three/drei'
import * as THREE from 'three'

interface OrbitRingProps {
  radius: number
}
interface PlanetRingProps {
  radius: number 
  color: string
}
interface PlanetProps {
  radius: number | undefined 
  posRef: Ref<THREE.Mesh>
  distance: number
  color: string
  planetRadius: number
}
const scaleFactor = 0.4;
const getScaledLength = (distance: number) => distance * scaleFactor;


function OrbitRing({ radius }: OrbitRingProps) {
  return (
    <mesh rotation={[0, 0, 0]}>
      <torusGeometry args={[getScaledLength(radius), 0.025, 8, 128]} />
      <meshBasicMaterial color="#333355" transparent opacity={0.5} />
    </mesh>
  )
}
function PlanetRing({ radius, color}: PlanetRingProps) {
  return (
    <mesh rotation={[0, 0, 0]}>
      <torusGeometry args={[getScaledLength(radius), 0.0125, 8, 128]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function Planet({ radius, posRef, distance, color, planetRadius}: PlanetProps) {  
  if (radius) {
    return (
      <mesh ref={posRef} position={[getScaledLength(distance), 0, 0]}>
        <Trail
                width={0.4}
                length={8}
                color={color}
                attenuation={(t) => t * t}
                target={posRef as React.MutableRefObject<THREE.Object3D>}
              >
                <mesh ref={posRef}>
                  <sphereGeometry args={[getScaledLength(planetRadius), 32, 32]} />
                  <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
                </mesh>
              </Trail>
        <PlanetRing radius={radius}
            color={color} />
     </mesh>
    )
  } else {
    return <Trail
      width={0.4}
      length={8}
      color={color}
      attenuation={(t) => t * t}
      target={posRef as React.MutableRefObject<THREE.Object3D>}
    >
      <mesh ref={posRef} position={[getScaledLength(distance), 0, 0]}>
        <sphereGeometry args={[getScaledLength(planetRadius), 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
    </Trail>
  }
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
  const planetProps: {
    color: string
    size: number
    distance: number
    angularVelocity: number
    ringSize?: number
    rolls?: boolean
  }[] = [
    { color: '#aaaaaa', size: 0.6, distance: baseDistance * 0.39, angularVelocity: 0.4*365/88 }, // mercury
    { color: '#ffaa66', size: 0.55, distance: baseDistance * 0.72, angularVelocity: 0.4*365/225}, // venus
    { color: '#2266cc', size: 0.6, distance: baseDistance, angularVelocity: 0.4 }, // earth
    { color: '#cc4422', size: 0.5, distance: baseDistance * 1.52, angularVelocity: 0.4*365/687 }, // mars
    { color: '#ffaa88', size: 1.2, distance: baseDistance * 5.2, angularVelocity: 0.4*365/4333 }, // jupiter
    { color: '#ddaa77', size: 1, distance: baseDistance * 9.58, angularVelocity: 0.4*365/10759, ringSize: 1.3}, // saturn
    { color: '#66aaff', size: 0.9, distance: baseDistance * 19.2, angularVelocity: 0.4*365/30687, rolls: true }, // uranus
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
        const distance = getScaledLength(planetProps[i].distance);
        const angularVelocity = planetProps[i].angularVelocity || 0.4;
        ref.current.position.x = Math.cos(t * angularVelocity) * distance;
        ref.current.position.y = Math.sin(t * angularVelocity) * distance;
        ref.current.rotation.z = t * 1.5
      }
    })

    if (moonRef.current && earthRef.current) {
      moonRef.current.position.x = earthRef.current.position.x + Math.cos(t * 1.8) * getScaledLength(.8)
      moonRef.current.position.y = earthRef.current.position.y + Math.sin(t * 1.8) * getScaledLength(.8)
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
        <sphereGeometry args={[getScaledLength(2), 40, 40]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ff6600"
          emissiveIntensity={1.2}
          roughness={0.8}
        />
      </mesh>

      {/* Sun glow */}
      <mesh>
        <sphereGeometry args={[getScaledLength(2.4), 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.08} />
      </mesh>

      {planetProps.map((props, i) => (
        <OrbitRing radius={(props.distance)} key={`orbit-${i}`} />
      ))}
      {planetProps.map((props, i) => (
           <Planet key={`planet-${i}`} radius={props.ringSize} posRef={planetRefs[i]}
           distance={props.distance}
           color={props.color}
           planetRadius={props.size} /> 
      ))}

      {/* Moon */}
      <mesh ref={moonRef} position={[getScaledLength(planetProps[2].distance + 0.8), 0, 0]}>
        <sphereGeometry args={[getScaledLength(0.18), 20, 20]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.9} />
      </mesh>
    </>
  )
}
