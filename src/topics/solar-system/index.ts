import type { Topic } from '../../types'
import Scene from './Scene'

export const solarSystemTopic: Topic = {
  id: 'solar-system',
  title: 'Solar System',
  description:
    'Watch the Earth orbit the Sun and the Moon orbit the Earth. Demonstrates orbital mechanics and relative speeds.',
  icon: '🌍',
  Scene,
}
