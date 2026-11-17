import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Results from './pages/Results'
import Leaderboard from './pages/Leaderboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lobby/:roomCode" element={<Lobby />} />
      <Route path="/game" element={<Game />} />
      <Route path="/results/:roomCode" element={<Results />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  )
}

export default App