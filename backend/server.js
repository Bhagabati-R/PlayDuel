import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import Match from './models/Match.js'
import cors from 'cors'

const app = express()
try {
  process.loadEnvFile()
} catch {
  console.log('No .env file found, using defaults')
}

const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(cors({ origin: CLIENT_URL }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((error) => console.error('MongoDB connection error:', error))
const TOTAL_IMAGES = 13
const PIECES = 9

const server = http.createServer(app)
const io = new Server(server, {
 cors: { origin: CLIENT_URL },
})

const rooms = {}

function makeCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function playerNames(code) {
  return rooms[code].players.map((player) => player.name)
}

function pickImage() {
  const number = Math.floor(Math.random() * TOTAL_IMAGES) + 1
  return `/puzzles/puzzle${number}.jpg`
}

function shuffledOrder() {
  const order = Array.from({ length: PIECES }, (_, i) => i)

  do {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
  } while (order.every((piece, position) => piece === position))

  return order
}

function calculateScore(seconds, moves) {
  return Math.max(0, 1000 - seconds * 3 - moves * 5)
}

function resultsData(room) {
  return {
    results: room.results,
    winnerRole: room.winner ? room.winner.role : null,
    rematch: Object.keys(room.rematch || {}),
  }
}

async function saveMatch(code, room) {
  try {
    const { A, B } = room.results

    await Match.create({
      roomCode: code,
      image: room.imageUrl,
      playerA: { name: A.name, seconds: A.seconds, moves: A.moves, score: A.score },
      playerB: { name: B.name, seconds: B.seconds, moves: B.moves, score: B.score },
      winner: room.winner.name,
    })

    console.log(`Match saved for room ${code}`)
  } catch (error) {
    console.error('Could not save match:', error.message)
  }
}

function startGame(code) {
  const room = rooms[code]

  room.started = true
  room.imageUrl = pickImage()
  room.order = shuffledOrder()
  room.results = {}
  room.winner = null
  room.rematch = {}
  room.startTime = Date.now()

  console.log(`Game started in room ${code} with ${room.imageUrl}`)
  io.to(code).emit('game-started', {
    imageUrl: room.imageUrl,
    order: room.order,
  })
}

app.get('/', (req, res) => {
  res.send('PlayDuel server is running')
})

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find().sort({ playedAt: -1 }).limit(20)
    res.json(matches)
  } catch (error) {
    console.error('Could not load matches:', error.message)
    res.status(500).json({ error: 'Could not load matches' })
  }
})

app.get('/api/leaderboard', async (req, res) => {
  try {
    const top = await Match.aggregate([
      { $project: { players: ['$playerA', '$playerB'], playedAt: 1 } },
      { $unwind: '$players' },
      { $sort: { 'players.score': -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          name: '$players.name',
          score: '$players.score',
          seconds: '$players.seconds',
          moves: '$players.moves',
          playedAt: 1,
        },
      },
    ])
    res.json(top)
  } catch (error) {
    console.error('Could not load leaderboard:', error.message)
    res.status(500).json({ error: 'Could not load leaderboard' })
  }
})
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  socket.on('create-room', (name, callback) => {
    let code = makeCode()
    while (rooms[code]) code = makeCode()

    rooms[code] = { players: [{ id: socket.id, name }], started: false }
    socket.join(code)

    console.log(`Room ${code} created by ${name}`)
    callback({ code })
  })

  socket.on('join-room', ({ code, name }, callback) => {
    const room = rooms[code]

    if (!room) {
      return callback({ ok: false, error: 'Room not found' })
    }

    if (room.players.length >= 2) {
      return callback({ ok: false, error: 'Room is full' })
    }

    room.players.push({ id: socket.id, name })
    socket.join(code)

    console.log(`${name} joined room ${code}`)
    io.to(code).emit('room-update', { players: playerNames(code) })
    callback({ ok: true })
  })

  socket.on('get-room', (code, callback) => {
    if (!rooms[code]) {
      return callback({ players: [] })
    }
    callback({ players: playerNames(code) })
  })

  socket.on('start-game', (code) => {
    const room = rooms[code]

    if (!room || room.players.length < 2 || room.started) return

    startGame(code)
  })

  socket.on('puzzle-complete', ({ code, moves }) => {
    const room = rooms[code]
    if (!room || !room.started) return

    const index = room.players.findIndex((player) => player.id === socket.id)
    if (index === -1) return

    const role = index === 0 ? 'A' : 'B'
    if (room.results[role]) return

    const seconds = Math.round((Date.now() - room.startTime) / 1000)
    const safeMoves = Math.max(0, Number(moves) || 0)
    const score = calculateScore(seconds, safeMoves)

    const result = {
      name: room.players[index].name,
      role,
      seconds,
      moves: safeMoves,
      score,
    }
    room.results[role] = result

    console.log(
      `${result.name} (Player ${role}) finished: ${seconds}s, ${safeMoves} moves, score ${score}`
    )

    if (!room.winner) {
      room.winner = result
      console.log(`Winner in room ${code}: ${result.name}`)
      io.to(code).emit('winner-declared', result)
    }

    io.to(code).emit('results-update', resultsData(room))

    if (room.results.A && room.results.B) {
      saveMatch(code, room)
    }
  })

  socket.on('get-results', (code, callback) => {
    const room = rooms[code]
    if (!room || !room.results) {
      return callback({ results: {}, winnerRole: null, rematch: [] })
    }
    callback(resultsData(room))
  })

  socket.on('play-again', (code) => {
    const room = rooms[code]
    if (!room || !room.results || !room.results.A || !room.results.B) return

    const index = room.players.findIndex((player) => player.id === socket.id)
    if (index === -1) return

    const role = index === 0 ? 'A' : 'B'
    room.rematch = room.rematch || {}
    room.rematch[role] = true

    console.log(`Player ${role} wants a rematch in room ${code}`)

    if (room.rematch.A && room.rematch.B) {
      startGame(code)
    } else {
      io.to(code).emit('results-update', resultsData(room))
    }
  })

  socket.on('chat-message', ({ code, text }) => {
    const room = rooms[code]
    if (!room) return

    const index = room.players.findIndex((player) => player.id === socket.id)
    if (index === -1) return

    const cleanText = String(text || '').trim().slice(0, 200)
    if (cleanText === '') return

    io.to(code).emit('chat-message', {
      name: room.players[index].name,
      role: index === 0 ? 'A' : 'B',
      text: cleanText,
    })
  })

  socket.on('progress', ({ code, correct }) => {
    if (!rooms[code]) return
    socket.to(code).emit('opponent-progress', { correct })
  })

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id)

    for (const code of Object.keys(rooms)) {
      const room = rooms[code]
      const player = room.players.find((p) => p.id === socket.id)
      if (!player) continue

      console.log(`${player.name} left room ${code}, closing it`)
      socket.to(code).emit('opponent-left', { name: player.name })
      delete rooms[code]
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`) 
}) 