import * as THREE from 'three'
// ─── Instanced voxel mesh ──────────────────────────────────────────────────

import { useEffect, useMemo, useRef } from "react";
export type VoxelType = 'grass' | 'dirt' | 'stone' | 'flower_red' | 'flower_yellow' | 'tall_grass'


export interface Voxel { x: number; y: number; z: number; type: VoxelType }
const COLORS: Record<VoxelType, number> = {
  grass:         0x4a7c3f,
  dirt:          0x8b6340,
  stone:         0x7a7a7a,
  flower_red:    0xe74c3c,
  flower_yellow: 0xf1c40f,
  tall_grass:    0x5d9e4a,
}

export function VoxelMesh({ voxels, type }: { voxels: Voxel[]; type: VoxelType }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const filtered = useMemo(() => voxels.filter(v => v.type === type), [voxels, type])
  const isDecor = type === 'flower_red' || type === 'flower_yellow' || type === 'tall_grass'

  const geo = useMemo(
    () => isDecor ? new THREE.PlaneGeometry(0.55, 0.55) : new THREE.BoxGeometry(1, 1, 1),
    [isDecor]
  )

  useEffect(() => {
    if (!meshRef.current || filtered.length === 0) return
    const dummy = new THREE.Object3D()
    filtered.forEach((v, i) => {
      dummy.position.set(v.x + 0.5, v.y + 0.5, v.z + 0.5)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [filtered])

  if (filtered.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined, filtered.length]} castShadow receiveShadow>
      <meshLambertMaterial
        color={COLORS[type]}
        side={isDecor ? THREE.DoubleSide : THREE.FrontSide}
      />
    </instancedMesh>
  )
}