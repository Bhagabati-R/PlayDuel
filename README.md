# PlayDuel 🎮
### Same Puzzle. Two Players. One Winner.

PlayDuel is a real-time multiplayer puzzle game where two players race to solve the same jigsaw puzzle. One player creates a private room, shares the room code with a friend, and both race to finish first.

## Features

- Enter your name, then create a room or join one with a room code
- Lobby that shows both players live
- Same random puzzle picture and same shuffle for both players, chosen by the server
- 3x3 drag-and-swap puzzle
- Timer and moves counter
- Live progress bars showing how much of the puzzle the opponent has solved
- The server measures the finish time and declares the first finisher the winner
- Score based on time and moves
- Results screen comparing both players
- Play Again (rematch) after both players finish
- Pop-up when the opponent leaves the game
- Real-time text chat
- Match history: every finished game is saved to MongoDB with both players' time, moves, score and the winner
- Leaderboard page with the top 10 scores and the latest 20 matches

## Tech Stack

| Technology | Purpose |
|---|---|
| React + Vite | Frontend |
| Tailwind CSS | Styling |
| React Router | Pages |
| Node.js + Express | Backend |
| Socket.IO | Real-time communication |
| MongoDB Atlas + Mongoose | Saving match history and the leaderboard |
| nodemon | Auto-restart during development |

## Project Structure

```text
PlayDuel/
├── frontend/
│   ├── public/puzzles/        puzzle1.jpg ... puzzle13.jpg
│   └── src/
│       ├── components/        Puzzle, Timer, Chat, OpponentLeft
│       ├── pages/             Home, Lobby, Game, Results, Leaderboard
│       ├── services/          socket.js
│       ├── App.jsx
│       └── main.jsx
├── backend/
│   ├── models/
│   │   └── Match.js           MongoDB model for a finished match
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## How to Run

You need Node.js and npm installed, and a free MongoDB Atlas cluster. Use two terminals.

**1. Database (MongoDB Atlas)**

1. Create a free account and an M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a database user (use a password with only letters and numbers).
3. Under Network Access, add your current IP address.
4. Copy the connection string for the Node.js driver and add the database name `playduel` before the `?`, for example:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/playduel?retryWrites=true&w=majority`

**2. Backend**

```bash
cd backend
npm install
```

Create a file named `.env` inside `backend`, copy the values from `.env.example`, and put your connection string in `MONGO_URI`. Then start the server:

```bash
npm run dev
```

The server runs at `http://localhost:5000`. The terminal should show `MongoDB connected successfully!`.

The game also runs without `MONGO_URI`, but matches are not saved and the leaderboard stays empty.

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

The game opens at `http://localhost:5173`.

**4. Play**

Open the game in two browser tabs. Create a room in the first tab, then join with the room code in the second tab. Finish the puzzle in both tabs to save the match, then open the Leaderboard from the Home page.

## How the Game Works

1. Player A enters a name and creates a room. The server makes a room code.
2. Player B enters a name and the room code to join.
3. Either player clicks Start Game. The server picks one picture and one shuffle for both players.
4. Both players solve their own board by dragging pieces to swap them.
5. When a player finishes, the server records the time and moves and works out the score.
6. The first player to finish wins. The Results screen compares both players.
7. When both players have finished, the server saves the match to MongoDB.

Score = 1000 - 3 points per second - 5 points per move (never below 0).

## API Endpoints

| Endpoint | Returns |
|---|---|
| `GET /api/matches` | The latest 20 finished matches, newest first |
| `GET /api/leaderboard` | The top 10 individual scores |

A match is saved only when both players finish. If a player leaves before finishing, the room closes and that game is not saved.

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
```

Never commit the real `.env` file to GitHub.

## Future Scope

- Voice chat with WebRTC and mute controls
- Player accounts with login (profiles with wins and games played)
- Multiple difficulty levels
- Custom puzzle image uploads
- Reconnecting after a page refresh
- Public matchmaking
- Hosting online (frontend on Vercel, backend on a host that runs an always-on Node server)

---

**PlayDuel — Same Puzzle. Two Players. One Winner.**