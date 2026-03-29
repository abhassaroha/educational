import { Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { TOPICS } from '../topics'

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#7eb8ff" wireframe />
    </mesh>
  )
}

export default function TopicView() {
  const { topicId } = useParams()
  const topic = TOPICS.find((t) => t.id === topicId)

  if (!topic) {
    return (
      <div className="topic-not-found">
        <h2>Topic not found</h2>
        <Link to="/" className="back-button">← Back to topics</Link>
      </div>
    )
  }

  const { Scene } = topic

  return (
    <div className="topic-view">
      <div className="topic-view-header">
        <Link to="/" className="back-button">← Back</Link>
        <h1>{topic.title}</h1>
      </div>

      <Canvas
        camera={{ position: [0, 5, 15], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
