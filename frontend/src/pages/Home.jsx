import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
function Home() {
    const navigate = useNavigate()
    const[roomCode, setRoomCode]=useState('')
    const[error, setError]=useState('')

const handleCreateRoom = () => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  console.log('Room created with code:', code)
  navigate(`/lobby/${code}`)
}

    const handleJoinRoom=()=>{
        if(roomCode.trim()==''){
            setError('Please enter a room code')
            return 
          // if no code is entered then it wot paass to the lobby
          //
        }
        setError('')
        console.log('Join Room Clicked with code:', roomCode)
        navigate(`/lobby/${roomCode}`)
        //it will only pass to the lobby only when the code is entered//

    }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        <h1 className="text-5xl font-bold text-purple-400">PlayDuel</h1>
        <p className="mt-3 text-slate-400">
          Same Puzzle. Two Players. One Winner.
        </p>

        <div className="mt-10 rounded-2xl bg-slate-900 p-6 space-y-6">

          <button 
             onClick={handleCreateRoom} 
             className="w-full rounded-lg bg-purple-500 py-3 font-semibold text-white hover:bg-purple-600">
            Create Room
          </button>

          <div className="text-slate-500 text-sm">or</div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e)=>setRoomCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-purple-500"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button 
              onClick={handleJoinRoom}
              className="w-full rounded-lg bg-slate-700 py-3 font-semibold text-white hover:bg-slate-600">
              Join Room
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home