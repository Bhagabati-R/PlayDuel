import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { socket } from '../services/socket'
import OpponentLeft from '../components/OpponentLeft'
import Chat from '../components/Chat'

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function PlayerCard({ column, isWinner, isMe }) {
  const { role, name, result } = column

  return (
    <div
      className={`relative rounded-2xl border-2 bg-slate-900 p-6 text-center ${
        isWinner
          ? 'border-yellow-400 shadow-lg shadow-yellow-500/20 sm:scale-105'
          : 'border-slate-800'
      }`}
    >
      {isWinner && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-4 py-1 text-sm font-bold text-slate-900">
          🏆 WINNER
        </div>
      )}

      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white ${
          role === 'A' ? 'bg-purple-500' : 'bg-pink-500'
        }`}
      >
        {name.charAt(0).toUpperCase()}
      </div>

      <p className="mt-3 text-xl font-bold text-white">
        {name}
        {isMe && <span className="text-sm font-medium text-purple-400"> (you)</span>}
      </p>
      <p className="text-sm text-slate-400">Player {role}</p>

      {result ? (
        <>
          <p className="mt-5 text-5xl font-extrabold text-white">{result.score}</p>
          <p className="text-xs uppercase tracking-widest text-slate-500">Score</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-800 p-3">
              <p className="text-xl font-bold text-white">{formatTime(result.seconds)}</p>
              <p className="text-xs text-slate-400">Time</p>
            </div>
            <div className="rounded-xl bg-slate-800 p-3">
              <p className="text-xl font-bold text-white">{result.moves}</p>
              <p className="text-xs text-slate-400">Moves</p>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-10 animate-pulse text-slate-400">Still playing...</p>
      )}
    </div>
  )
}

function Results() {
  const { roomCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const myRole = location.state?.role
  const myName = location.state?.name || 'Guest'

  const [players, setPlayers] = useState([])
  const [data, setData] = useState({ results: {}, winnerRole: null, rematch: [] })

  useEffect(() => {
    socket.emit('get-room', roomCode, (response) => {
      setPlayers(response.players)
    })

    socket.emit('get-results', roomCode, (response) => {
      setData(response)
    })

    const handleUpdate = (response) => {
      setData(response)
    }

    const handleGameStarted = (gameData) => {
      navigate('/game', {
        state: {
          name: myName,
          role: myRole,
          roomCode,
          imageUrl: gameData.imageUrl,
          order: gameData.order,
        },
      })
    }

    socket.on('results-update', handleUpdate)
    socket.on('game-started', handleGameStarted)

    return () => {
      socket.off('results-update', handleUpdate)
      socket.off('game-started', handleGameStarted)
    }
  }, [roomCode, navigate, myName, myRole])

  const columns = ['A', 'B'].map((role, index) => ({
    role,
    name: players[index] || '...',
    result: data.results[role],
  }))

  const winnerColumn = columns.find((column) => column.role === data.winnerRole)

  const bothDone = Boolean(data.results.A && data.results.B)
  const iRequested = data.rematch.includes(myRole)
  const opponentRequested = data.rematch.some((role) => role !== myRole)
  const opponentName = columns.find((column) => column.role !== myRole)?.name || 'Opponent'

  const handlePlayAgain = () => {
    socket.emit('play-again', roomCode)
  }

  let playAgainLabel = 'Play Again'
  if (!bothDone) playAgainLabel = 'Play Again (when both have finished)'
  else if (iRequested) playAgainLabel = 'Waiting for opponent...'
  else if (opponentRequested) playAgainLabel = `${opponentName} wants a rematch! Play Again`

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <OpponentLeft />
      <Chat roomCode={roomCode} myRole={myRole} />
      <div className="w-full max-w-2xl text-center">
        <div
          className="rounded-2xl p-6"
          style={{ backgroundImage: 'linear-gradient(to right, #a855f7, #ec4899)' }}
        >
          {winnerColumn ? (
            <>
              <p className="text-4xl font-extrabold text-white">
                {winnerColumn.role === myRole ? 'You won! 🎉' : `${winnerColumn.name} won!`}
              </p>
              <p className="mt-1 text-white/80">First to finish the puzzle</p>
            </>
          ) : (
            <p className="text-3xl font-extrabold text-white">Waiting for the first finisher...</p>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-500">Room {roomCode}</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {columns.map((column) => (
            <PlayerCard
              key={column.role}
              column={column}
              isWinner={column.role === data.winnerRole}
              isMe={column.role === myRole}
            />
          ))}
        </div>

        <button
          onClick={handlePlayAgain}
          disabled={!bothDone || iRequested}
          className="mt-10 w-full rounded-lg bg-purple-500 py-3 font-semibold text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playAgainLabel}
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-3 w-full rounded-lg bg-slate-700 py-3 font-semibold text-white hover:bg-slate-600"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default Results