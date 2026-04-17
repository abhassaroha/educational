import type { Topic } from '../../types'
import { Scene } from './Scene'

export const voxelGrasslandTopic: Topic = {
  id: 'voxel-grassland',
  title: 'Voxel Grassland',
  description: 'Explore a procedurally generated voxel grassland in first-person. Use WASD to move, mouse to look.',
  icon: '🌿',
  Scene,
}
