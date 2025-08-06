import React, { useState } from 'react'

function App() {
  const [prompt, setPrompt] = useState('')
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [downloadReady, setDownloadReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Submitting...')
    setDownloadReady(false)
    setJobId(null)
    try {
      const res = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setJobId(data.id)
      setStatus('Job submitted. Waiting for updates...')
      const socket = new WebSocket(`ws://localhost:8000/ws/${data.id}`)
      setWs(socket)
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.event === 'done') {
          setStatus('Job complete!')
          setDownloadReady(true)
          socket.close()
        } else {
          setStatus(msg.content || JSON.stringify(msg))
        }
      }
      socket.onerror = () => setStatus('WebSocket error')
    } catch (err) {
      setStatus('Error submitting job')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">sumeru-ai.dev Replica</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4 mb-6">
        <textarea
          className="p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 font-semibold transition"
        >
          Submit
        </button>
      </form>
      <div className="mb-4 text-lg min-h-[2rem]">{status}</div>
      {downloadReady && jobId && (
        <a
          href={`http://localhost:8000/download/${jobId}`}
          className="bg-green-600 hover:bg-green-700 rounded px-4 py-2 font-semibold transition"
        >
          Download Result
        </a>
      )}
    </div>
  )
}

export default App 