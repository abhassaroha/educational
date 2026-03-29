import type { Topic } from '../../types'
import Scene from './Scene'

export const waveTopic: Topic = {
  id: 'wave',
  title: 'Wave Harmonics',
  description:
    'Animated sine waves showing the fundamental frequency and its harmonics, plus their superposition (Fourier synthesis).',
  icon: '〰️',
  Scene,
}
