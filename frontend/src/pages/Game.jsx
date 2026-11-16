import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Puzzle from '../components/Puzzle'
import Timer from '../components/Timer'
import { socket } from '../services/socket'

function Game() {
  const location = useLocation()

  const name = location.state?.name || 'Guest'
  const role = location.state?.role || 'A'
  const roomCode = location.state?.roomCode
  const imageUrl = location.state?.imageUrl || '/puzzles/puzzle1.jpg'
  const order = location.state?.order

  const [seconds, setSeconds] = useState(0)
  const [moves, setMoves] = useState(0)
  const [solved, setSolved] = useState(false)
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    if (solved) return

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [solved])

  useEffect(() => {
    if (!solved || !roomCode) return

    socket.emit('puzzle-complete', { code: roomCode, seconds, moves })
  }, [solved, roomCode, seconds, moves])

  useEffect(() => {
    const handleWinner = (result) => {
      setWinner(result)
    }

    socket.on('winner-declared', handleWinner)

    return () => {
      socket.off('winner-declared', handleWinner)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-purple-400">Game</h1>
      <p className="mt-2 text-slate-300">
        Player {role}: {name}
      </p>

      <div className="mt-2 mb-6 flex items-center gap-8">
        <Timer seconds={seconds} />
        <p className="text-xl font-semibold text-slate-300">Moves: {moves}</p>
      </div>

      <Puzzle
        imageUrl={imageUrl}
        initialOrder={order}
        onMove={() => setMoves((prev) => prev + 1)}
        onSolved={() => setSolved(true)}
        disabled={solved}
      />

      {winner && (
        <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-center">
          {winner.role === role ? (
            <p className="text-2xl font-bold text-green-400">You won! 🎉</p>
          ) : (
            <p className="text-2xl font-bold text-red-400">{winner.name} won!</p>
          )}
          <p className="mt-2 text-slate-400">
            Winner's time: {winner.seconds}s, moves: {winner.moves}
          </p>
        </div>
      )}

      {solved && !winner && (
        <p className="mt-6 text-slate-400">Puzzle complete! Waiting for the server...</p>
      )}
    </div>
  )
}

export default Game