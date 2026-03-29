/// <reference types="vite/client" />
/// <reference types="@react-three/fiber" />

import type { Object3DNode } from '@react-three/fiber'
import type * as THREE from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      line_: Object3DNode<THREE.Line, typeof THREE.Line>
    }
  }
}
