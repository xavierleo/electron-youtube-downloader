import { useEffect, useMemo, useState } from 'react'

const initialStatus = 'idle'

function formatDuration(seconds) {
  if (!seconds) return 'Unknown length'
  const minutes = Math.floor(seconds / 60)
  const remaining = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remaining}`
}

function App() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState(initialStatus)
  const [video, setVideo] = useState(null)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Paste a YouTube video or playlist URL to begin.')
  const [error, setError] = useState('')

  const canSearch = url.trim().length > 0 && status !== 'loading' && status !== 'downloading'
  const canDownload = Boolean(video) && status !== 'loading' && status !== 'downloading'

  const statusLabel = useMemo(() => {
    if (status === 'loading') return 'Fetching details'
    if (status === 'ready') return 'Ready'
    if (status === 'downloading') return 'Downloading'
    if (status === 'complete') return 'Complete'
    if (status === 'error') return 'Needs attention'
    return 'Idle'
  }, [status])

  useEffect(() => {
    return window.downloader.onProgress(update => {
      if (typeof update.percent === 'number') {
        setProgress(Math.round(update.percent))
      }
      if (update.message) {
        setMessage(update.message)
      }
    })
  }, [])

  async function handleSearch(event) {
    event.preventDefault()
    setError('')
    setVideo(null)
    setProgress(0)
    setStatus('loading')
    setMessage('Reading video details...')

    try {
      const result = await window.downloader.getInfo(url.trim())
      setVideo(result)
      setStatus('ready')
      setMessage('Details loaded. Ready to download.')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Unable to fetch video details.')
      setMessage('Could not read details for that URL.')
    }
  }

  async function handleDownload() {
    if (!video) return
    setError('')
    setProgress(0)
    setStatus('downloading')
    setMessage('Starting download...')

    try {
      await window.downloader.download({ url: video.downloadUrl })
      setProgress(100)
      setStatus('complete')
      setMessage('Download complete. Saved to your Downloads folder.')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Download failed.')
      setMessage('The download did not finish.')
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="app-header">
          <div>
            <p className="eyebrow">Desktop utility</p>
            <h1>YouTube Downloader</h1>
          </div>
          <span className={`status-pill status-${status}`}>{statusLabel}</span>
        </header>

        <form className="url-form" onSubmit={handleSearch}>
          <label htmlFor="video-url">Video or playlist URL</label>
          <div className="url-row">
            <input
              id="video-url"
              type="url"
              value={url}
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={event => setUrl(event.target.value)}
            />
            <button type="submit" disabled={!canSearch}>Search</button>
          </div>
        </form>

        {error ? <p className="error-message">{error}</p> : null}

        <section className="result-panel" aria-live="polite">
          {video ? (
            <>
              <div className="thumbnail-frame">
                {video.thumbnail ? <img src={video.thumbnail} alt="" /> : <div className="thumbnail-empty" />}
              </div>
              <div className="video-details">
                <p className="eyebrow">{video.uploader || 'YouTube'}</p>
                <h2>{video.title}</h2>
                <p>{formatDuration(video.duration)}</p>
                <button type="button" onClick={handleDownload} disabled={!canDownload}>
                  Download MP4
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h2>No video selected</h2>
              <p>Search for a URL to preview it here before downloading.</p>
            </div>
          )}
        </section>

        <section className="progress-panel">
          <div className="progress-meta">
            <span>{message}</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
