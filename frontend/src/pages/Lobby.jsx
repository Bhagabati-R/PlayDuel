import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { socket } from '../services/socket'
import OpponentLeft from '../components/OpponentLeft'
import Chat from '../components/Chat'

function Lobby() {
  const { roomCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const name = location.state?.name || 'Guest'
  const role = location.state?.role || 'A'

  const [players, setPlayers] = useState([])

  useEffect(() => {
    socket.emit('get-room', roomCode, (response) => {
      setPlayers(response.players)
    })

    const handleRoomUpdate = (data) => {
      setPlayers(data.players)
    }

    const handleGameStarted = (data) => {
      navigate('/game', {
        state: {
          name,
          role,
          roomCode,
          imageUrl: data.imageUrl,
          order: data.order,
        },
      })
    }

    socket.on('room-update', handleRoomUpdate)
    socket.on('game-started', handleGameStarted)

    return () => {
      socket.off('room-update', handleRoomUpdate)
      socket.off('game-started', handleGameStarted)
    }
  }, [roomCode, navigate, name, role])

  const handleStart = () => {
    socket.emit('start-game', roomCode)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <OpponentLeft />
      <Chat roomCode={roomCode} myRole={role} />
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-purple-400">Lobby</h1>

        <p className="mt-3 text-slate-400">Room code</p>
        <p className="mt-1 text-3xl font-bold tracking-widest text-white">{roomCode}</p>

        <div className="mt-8 rounded-2xl bg-slate-900 p-6 space-y-3">
          <p className="text-slate-400 text-sm">Players in this room</p>

          <p className="text-xl font-semibold text-white">
            Player A: {players[0] || '...'}
          </p>
          <p className="text-xl font-semibold text-white">
            Player B: {players[1] || 'Waiting for opponent...'}
          </p>
        </div>

        <p className="mt-4 text-slate-500 text-sm">You are Player {role}: {name}</p>

        <button
          onClick={handleStart}
          disabled={players.length < 2}
          className="mt-6 w-full rounded-lg bg-purple-500 py-3 font-semibold text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}

export default Lobby