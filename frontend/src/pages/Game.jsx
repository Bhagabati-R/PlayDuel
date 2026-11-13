import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Puzzle from '../components/Puzzle'
import Timer from '../components/Timer'

function Game() {
  const location = useLocation()

  const name = location.state?.name || 'Guest'
  const role = location.state?.role || 'A'

  const [seconds, setSeconds] = useState(0)
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    if (solved) return

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [solved])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-purple-400">Game</h1>
      <p className="mt-2 text-slate-300">
        Player {role}: {name}
      </p>
      <div className="mt-2 mb-6">
        <Timer seconds={seconds} />
      </div>

      <Puzzle onSolved={() => setSolved(true)} disabled={solved} />

      {solved && (
        <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-center">
          <p className="text-2xl font-bold text-green-400">You win, {name}! 🎉</p>
          <p className="mt-2 text-slate-400">Your time</p>
          <Timer seconds={seconds} />
        </div>
      )}
    </div>
  )
}

export default Game