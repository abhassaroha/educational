import type { ComponentType } from 'react'

export interface Topic {
  id: string
  title: string
  description: string
  icon: string
  Scene: ComponentType
}
