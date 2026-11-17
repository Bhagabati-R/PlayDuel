import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../services/socket'

function OpponentLeft() {
  const navigate = useNavigate()
  const [leftName, setLeftName] = useState(null)

  useEffect(() => {
    const handleLeft = (data) => {
      setLeftName(data.name)
    }

    socket.on('opponent-left', handleLeft)

    return () => {
      socket.off('opponent-left', handleLeft)
    }
  }, [])

  if (!leftName) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 text-center">
        <p className="text-2xl font-bold text-red-400">{leftName} left the game</p>
        <p className="mt-2 text-slate-400">This room is now closed.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full rounded-lg bg-purple-500 py-3 font-semibold text-white hover:bg-purple-600"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default OpponentLeft