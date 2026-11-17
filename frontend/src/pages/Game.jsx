import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Puzzle from '../components/Puzzle'
import Timer from '../components/Timer'
import OpponentLeft from '../components/OpponentLeft'
import Chat from '../components/Chat'
import { socket } from '../services/socket'

const TOTAL_PIECES = 9

function ProgressBar({ label, correct, color }) {
  const percent = Math.round((correct / TOTAL_PIECES) * 100)

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-800">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function Game() {
  const location = useLocation()
  const navigate = useNavigate()

  const name = location.state?.name || 'Guest'
  const role = location.state?.role || 'A'
  const roomCode = location.state?.roomCode
  const imageUrl = location.state?.imageUrl || '/puzzles/puzzle1.jpg'
  const order = location.state?.order

  const [seconds, setSeconds] = useState(0)
  const [moves, setMoves] = useState(0)
  const [solved, setSolved] = useState(false)
  const [winner, setWinner] = useState(null)
  const [myProgress, setMyProgress] = useState(0)
  const [opponentProgress, setOpponentProgress] = useState(0)

  useEffect(() => {
    if (solved) return

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [solved])

  useEffect(() => {
    if (!solved || !roomCode) return

    socket.emit('puzzle-complete', { code: roomCode, moves })
    navigate(`/results/${roomCode}`, { state: { name, role } })
  }, [solved, roomCode, moves, navigate, name, role])

  useEffect(() => {
    const handleWinner = (result) => {
      setWinner(result)
    }

    const handleOpponentProgress = (data) => {
      setOpponentProgress(data.correct)
    }

    socket.on('winner-declared', handleWinner)
    socket.on('opponent-progress', handleOpponentProgress)

    return () => {
      socket.off('winner-declared', handleWinner)
      socket.off('opponent-progress', handleOpponentProgress)
    }
  }, [])

  const handleProgress = (correct) => {
    setMyProgress(correct)
    if (roomCode) {
      socket.emit('progress', { code: roomCode, correct })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <OpponentLeft />
      <Chat roomCode={roomCode} myRole={role} />

      <h1 className="text-4xl font-bold text-purple-400">Game</h1>
      <p className="mt-2 text-slate-300">
        Player {role}: {name}
      </p>

      <div className="mt-2 mb-4 flex items-center gap-8">
        <Timer seconds={seconds} />
        <p className="text-xl font-semibold text-slate-300">Moves: {moves}</p>
      </div>

      <div className="mb-6 w-80 space-y-3">
        <ProgressBar label="You" correct={myProgress} color="bg-purple-500" />
        <ProgressBar label="Opponent" correct={opponentProgress} color="bg-pink-500" />
      </div>

      <Puzzle
        imageUrl={imageUrl}
        initialOrder={order}
        onMove={() => setMoves((prev) => prev + 1)}
        onProgress={handleProgress}
        onSolved={() => setSolved(true)}
        disabled={solved}
      />

      {winner && !solved && (
        <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-center">
          <p className="text-2xl font-bold text-red-400">{winner.name} finished first!</p>
          <p className="mt-2 text-slate-400">Keep going, finish your puzzle to see the results.</p>
        </div>
      )}

      {solved && !roomCode && (
        <p className="mt-6 text-green-400">Puzzle complete! 🎉</p>
      )}
    </div>
  )
}

export default Game