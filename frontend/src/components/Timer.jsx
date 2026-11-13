function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function Timer({ seconds }) {
  return (
    <p className="text-3xl font-mono font-bold text-white">
      {formatTime(seconds)}
    </p>
  )
}

export default Timer