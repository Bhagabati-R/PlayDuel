import { useParams, useLocation, useNavigate } from 'react-router-dom'

function Lobby() {
  const { roomCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const name = location.state?.name || 'Guest'
  const role = location.state?.role || 'A'

  const handleStart = () => {
    navigate('/game', { state: { name, role, roomCode } })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-purple-400">Lobby</h1>

        <p className="mt-3 text-slate-400">Room code</p>
        <p className="mt-1 text-3xl font-bold tracking-widest text-white">{roomCode}</p>

        <div className="mt-8 rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400 text-sm">You are</p>
          <p className="mt-1 text-xl font-semibold text-white">
            Player {role}: {name}
          </p>
        </div>

        <p className="mt-6 text-slate-400">Waiting for the opponent...</p>

        <button
          onClick={handleStart}
          className="mt-6 w-full rounded-lg bg-purple-500 py-3 font-semibold text-white hover:bg-purple-600"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}

export default Lobby