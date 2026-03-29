import type { Topic } from '../../types'
import Scene from './Scene'

export const pendulumTopic: Topic = {
  id: 'pendulum',
  title: 'Pendulum Physics',
  description:
    'Four pendulums of increasing length swing simultaneously, illustrating how the period T = 2π√(L/g) depends on length, not mass.',
  icon: '⏱️',
  Scene,
}
