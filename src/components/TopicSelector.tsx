import { Link } from 'react-router-dom'
import { TOPICS } from '../topics'

export default function TopicSelector() {
  return (
    <div className="topic-selector">
      <h1>Educational Visualizations</h1>
      <p className="subtitle">Interactive 3D simulations for science and physics concepts</p>

      <div className="topic-grid">
        {TOPICS.map((topic) => (
          <Link
            key={topic.id}
            to={`/topics/${topic.id}`}
            className="topic-card"
          >
            <div className="topic-icon">{topic.icon}</div>
            <h2>{topic.title}</h2>
            <p>{topic.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
