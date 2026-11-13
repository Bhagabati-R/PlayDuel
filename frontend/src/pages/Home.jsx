import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [nameError, setNameError] = useState('')
  const [codeError, setCodeError] = useState('')

  const checkName = () => {
    if (name.trim() === '') {
      setNameError('Please enter your name')
      return false
    }
    setNameError('')
    return true
  }

  const handleCreateRoom = () => {
    if (!checkName()) return

    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    navigate(`/lobby/${code}`, { state: { name: name.trim() , role:'A'} })
  }

  const handleJoinRoom = () => {
    if (!checkName()) return

    if (roomCode.trim() === '') {
      setCodeError('Please enter a room code')
      return
    }

    setCodeError('')
    navigate(`/lobby/${roomCode}`, { state: { name: name.trim(),role:'B'} })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        <h1 className="text-5xl font-bold text-purple-400">PlayDuel</h1>
        <p className="mt-3 text-slate-400">
          Same Puzzle. Two Players. One Winner.
        </p>

        <div className="mt-10 rounded-2xl bg-slate-900 p-6 space-y-6">

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
              className="w-full rounded-lg bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-purple-500"
            />
            {nameError && <p className="text-sm text-red-400">{nameError}</p>}
          </div>

          <button
            onClick={handleCreateRoom}
            className="w-full rounded-lg bg-purple-500 py-3 font-semibold text-white hover:bg-purple-600"
          >
            Create Room
          </button>

          <div className="text-slate-500 text-sm">or</div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-purple-500"
            />
            {codeError && <p className="text-sm text-red-400">{codeError}</p>}

            <button
              onClick={handleJoinRoom}
              className="w-full rounded-lg bg-slate-700 py-3 font-semibold text-white hover:bg-slate-600"
            >
              Join Room
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home