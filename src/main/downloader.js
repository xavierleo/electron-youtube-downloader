const os = require('os')
const path = require('path')
const youtubedl = require('youtube-dl-exec')

function parseDownloadProgress(line) {
  const match = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%/)
  return match ? Number(match[1]) : null
}

function normalizeInfo(info, requestedUrl) {
  const entries = Array.isArray(info.entries) ? info.entries.filter(Boolean) : []
  const video = entries[0] || info

  return {
    id: video.id || '',
    title: video.title || info.title || 'Untitled video',
    thumbnail: video.thumbnail || info.thumbnail || '',
    duration: video.duration || info.duration || null,
    uploader: video.uploader || video.channel || info.uploader || info.channel || '',
    webpageUrl: video.webpage_url || info.webpage_url || requestedUrl,
    downloadUrl: requestedUrl
  }
}

async function getInfo(url) {
  const info = await youtubedl(url, {
    dumpSingleJson: true,
    noWarnings: true,
    noCheckCertificates: true
  })

  return normalizeInfo(info, url)
}

function downloadVideo({ url, outputDirectory = path.join(os.homedir(), 'Downloads'), onProgress }) {
  const subprocess = youtubedl.exec(url, {
    format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    mergeOutputFormat: 'mp4',
    output: path.join(outputDirectory, '%(title)s.%(ext)s'),
    newline: true,
    noWarnings: true,
    noCheckCertificates: true
  })

  subprocess.stderr.on('data', chunk => {
    const lines = chunk.toString().split(/\r?\n/).filter(Boolean)
    for (const line of lines) {
      const percent = parseDownloadProgress(line)
      if (percent !== null && onProgress) {
        onProgress({ percent, message: line })
      }
    }
  })

  return subprocess
}

module.exports = {
  downloadVideo,
  getInfo,
  normalizeInfo,
  parseDownloadProgress
}
