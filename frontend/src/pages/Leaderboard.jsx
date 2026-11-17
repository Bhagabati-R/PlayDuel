import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

function formatDate(value) {
  return new Date(value).toLocaleString()
}

function Leaderboard() {
  const [tab, setTab] = useState('leaderboard')
  const [top, setTop] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [topRes, matchesRes] = await Promise.all([
          fetch(`${SERVER_URL}/api/leaderboard`),
          fetch(`${SERVER_URL}/api/matches`),
        ])

        if (!topRes.ok || !matchesRes.ok) {
          throw new Error('Server error')
        }

        setTop(await topRes.json())
        setMatches(await matchesRes.json())
      } catch {
        setError('Could not load data. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <Link to="/" className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
          Home
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab('leaderboard')}
          className={`rounded px-4 py-2 ${
            tab === 'leaderboard' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          Top Scores
        </button>
        <button
          onClick={() => setTab('history')}
          className={`rounded px-4 py-2 ${
            tab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          Match History
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && tab === 'leaderboard' && (
        top.length === 0 ? (
          <p>No matches played yet.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">#</th>
                <th>Player</th>
                <th>Score</th>
                <th>Time</th>
                <th>Moves</th>
              </tr>
            </thead>
            <tbody>
              {top.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{i + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.score}</td>
                  <td>{row.seconds}s</td>
                  <td>{row.moves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {!loading && !error && tab === 'history' && (
        matches.length === 0 ? (
          <p>No matches played yet.</p>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match._id} className="rounded border p-4">
                <p className="font-semibold">Winner: {match.winner}</p>
                <p>
                  {match.playerA.name}: {match.playerA.score} pts ({match.playerA.seconds}s,{' '}
                  {match.playerA.moves} moves)
                </p>
                <p>
                  {match.playerB.name}: {match.playerB.score} pts ({match.playerB.seconds}s,{' '}
                  {match.playerB.moves} moves)
                </p>
                <p className="text-sm text-gray-500">{formatDate(match.playedAt)}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default Leaderboard