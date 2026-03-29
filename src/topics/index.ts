import type { Topic } from '../types'
import { solarSystemTopic } from './solar-system'
import { pendulumTopic } from './pendulum'
import { waveTopic } from './wave'

export const TOPICS: Topic[] = [solarSystemTopic, pendulumTopic, waveTopic]
