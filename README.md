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

## Tech Stack

| Technology | Purpose |
|---|---|
| React + Vite | Frontend |
| Tailwind CSS | Styling |
| React Router | Pages |
| Node.js + Express | Backend |
| Socket.IO | Real-time communication |
| nodemon | Auto-restart during development |

## Project Structure

```text
PlayDuel/
├── frontend/
│   ├── public/puzzles/        puzzle1.jpg ... puzzle13.jpg
│   └── src/
│       ├── components/        Puzzle, Timer, Chat, OpponentLeft
│       ├── pages/             Home, Lobby, Game, Results
│       ├── services/          socket.js
│       ├── App.jsx
│       └── main.jsx
├── backend/
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## How to Run

You need Node.js and npm installed. Use two terminals.

**1. Backend**

```bash
cd backend
npm install
```

Create a file named `.env` inside `backend` and copy the values from `.env.example`, then start the server:

```bash
npm run dev
```

The server runs at `http://localhost:5000`.

**2. Frontend**

```bash
cd frontend
npm install
npm run dev
```

The game opens at `http://localhost:5173`.

**3. Play**

Open the game in two browser tabs. Create a room in the first tab, then join with the room code in the second tab.

## How the Game Works

1. Player A enters a name and creates a room. The server makes a room code.
2. Player B enters a name and the room code to join.
3. Either player clicks Start Game. The server picks one picture and one shuffle for both players.
4. Both players solve their own board by dragging pieces to swap them.
5. When a player finishes, the server records the time and moves and works out the score.
6. The first player to finish wins. The Results screen compares both players.

Score = 1000 - 3 points per second - 5 points per move (never below 0).

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

Never commit the real `.env` file to GitHub.

## Future Scope

- Voice chat with WebRTC and mute controls
- MongoDB for player profiles, match history and a leaderboard
- Multiple difficulty levels
- Custom puzzle image uploads
- Reconnecting after a page refresh
- Public matchmaking

---

**PlayDuel — Same Puzzle. Two Players. One Winner.**