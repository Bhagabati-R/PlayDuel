import { useState, useEffect, useRef } from 'react'
import { socket } from '../services/socket'

function Chat({ roomCode, myRole }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    const handleMessage = (message) => {
      setMessages((prev) => [...prev, message])
    }

    socket.on('chat-message', handleMessage)

    return () => {
      socket.off('chat-message', handleMessage)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (text.trim() === '') return

    socket.emit('chat-message', { code: roomCode, text: text.trim() })
    setText('')
  }

  if (!roomCode) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
      <p className="border-b border-slate-800 px-4 py-2 text-sm font-semibold text-slate-300">
        Chat
      </p>

      <div className="h-40 space-y-2 overflow-y-auto px-3 py-2">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">No messages yet. Say hi 👋</p>
        )}

        {messages.map((message, index) => {
          const isMe = message.role === myRole

          return (
            <div key={index} className={isMe ? 'text-right' : 'text-left'}>
              {!isMe && <p className="text-xs text-slate-500">{message.name}</p>}
              <p
                className={`inline-block max-w-full break-words rounded-xl px-3 py-1 text-sm text-white ${
                  isMe ? 'bg-purple-500' : 'bg-slate-700'
                }`}
              >
                {message.text}
              </p>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-slate-800 p-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          maxLength={200}
          placeholder="Type a message..."
          className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleSend}
          className="rounded-lg bg-purple-500 px-3 text-sm font-semibold text-white hover:bg-purple-600"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat