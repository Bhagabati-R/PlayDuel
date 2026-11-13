import { useParams } from 'react-router-dom'

function Lobby() {
  const { roomCode } = useParams()

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-purple-400">Lobby</h1>
        <p className="mt-3 text-slate-400">Room code</p>
        <p className="mt-1 text-3xl font-bold tracking-widest text-white">{roomCode}</p>
        <p className="mt-6 text-slate-400">Waiting for the opponent...</p>
      </div>
    </div>
  )
}

export default Lobby