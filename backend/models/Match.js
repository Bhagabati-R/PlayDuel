import mongoose from 'mongoose'

const playerSchema = new mongoose.Schema(
  {
    name: String,
    seconds: Number,
    moves: Number,
    score: Number,
  },
  { _id: false }
)

const matchSchema = new mongoose.Schema({
  roomCode: String,
  image: String,
  playerA: playerSchema,
  playerB: playerSchema,
  winner: String,
  playedAt: { type: Date, default: Date.now },
})

export default mongoose.model('Match', matchSchema)