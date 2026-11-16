import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const app = express()
const PORT = 5000
const TOTAL_IMAGES = 13
const PIECES = 9

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' },
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

app.get('/', (req, res) => {
  res.send('PlayDuel server is running')
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

    room.started = true
    room.imageUrl = pickImage()
    room.order = shuffledOrder()
    room.results = {}
    room.winner = null

    console.log(`Game started in room ${code} with ${room.imageUrl}`)
    io.to(code).emit('game-started', {
      imageUrl: room.imageUrl,
      order: room.order,
    })
  })

  socket.on('puzzle-complete', ({ code, seconds, moves }) => {
    const room = rooms[code]
    if (!room || !room.started) return

    const index = room.players.findIndex((player) => player.id === socket.id)
    if (index === -1) return

    const role = index === 0 ? 'A' : 'B'
    if (room.results[role]) return

    const result = { name: room.players[index].name, role, seconds, moves }
    room.results[role] = result

    console.log(`${result.name} (Player ${role}) finished in ${seconds}s with ${moves} moves`)

    if (!room.winner) {
      room.winner = result
      console.log(`Winner in room ${code}: ${result.name}`)
      io.to(code).emit('winner-declared', result)
    }
  })

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})