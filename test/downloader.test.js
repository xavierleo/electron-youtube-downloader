const test = require('node:test')
const assert = require('node:assert/strict')

const {
  normalizeInfo,
  parseDownloadProgress
} = require('../src/main/downloader')

test('parseDownloadProgress extracts numeric download percent', () => {
  assert.equal(parseDownloadProgress('[download]  42.7% of 10.00MiB at 1.00MiB/s'), 42.7)
})

test('parseDownloadProgress returns null when line has no progress percent', () => {
  assert.equal(parseDownloadProgress('[youtube] Extracting URL: https://youtu.be/demo'), null)
})

test('normalizeInfo keeps playlist target url and picks first available entry', () => {
  const result = normalizeInfo({
    title: 'Playlist title',
    webpage_url: 'https://youtube.com/playlist?list=demo',
    entries: [
      null,
      {
        id: 'abc123',
        title: 'Video title',
        thumbnail: 'https://img.example/thumb.jpg',
        duration: 95,
        uploader: 'Channel name',
        webpage_url: 'https://youtube.com/watch?v=abc123'
      }
    ]
  }, 'https://youtube.com/playlist?list=demo')

  assert.deepEqual(result, {
    id: 'abc123',
    title: 'Video title',
    thumbnail: 'https://img.example/thumb.jpg',
    duration: 95,
    uploader: 'Channel name',
    webpageUrl: 'https://youtube.com/watch?v=abc123',
    downloadUrl: 'https://youtube.com/playlist?list=demo'
  })
})
