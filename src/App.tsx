import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TopicSelector from './components/TopicSelector'
import TopicView from './components/TopicView'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopicSelector />} />
        <Route path="/topics/:topicId" element={<TopicView />} />
      </Routes>
    </BrowserRouter>
  )
}
