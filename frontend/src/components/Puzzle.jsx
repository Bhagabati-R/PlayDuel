import { useState, useEffect } from 'react'

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function Puzzle({ imageUrl, initialOrder, onSolved, onMove, onProgress, disabled }) {
  const size = 3

  const [order, setOrder] = useState(
    () => initialOrder || shuffle(Array.from({ length: size * size }, (_, i) => i))
  )
  const [dragFrom, setDragFrom] = useState(null)

  useEffect(() => {
    if (!onProgress) return
    const correct = order.filter((piece, position) => piece === position).length
    onProgress(correct)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order])

  const handleDrop = (dropPosition) => {
    if (disabled) return
    if (dragFrom === null || dragFrom === dropPosition) return

    const newOrder = [...order]
    ;[newOrder[dragFrom], newOrder[dropPosition]] = [newOrder[dropPosition], newOrder[dragFrom]]
    setOrder(newOrder)
    setDragFrom(null)
    onMove()

    const isSolved = newOrder.every((piece, position) => piece === position)
    if (isSolved) onSolved()
  }

  return (
    <div className="grid grid-cols-3 gap-1 w-80 h-80">
      {order.map((pieceIndex, position) => {
        const row = Math.floor(pieceIndex / size)
        const col = pieceIndex % size

        return (
          <div
            key={pieceIndex}
            draggable={!disabled}
            onDragStart={() => setDragFrom(position)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(position)}
            className={`w-full h-full ${disabled ? '' : 'cursor-grab'}`}
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${size * 100}% ${size * 100}%`,
              backgroundPosition: `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`,
            }}
          />
        )
      })}
    </div>
  )
}

export default Puzzle