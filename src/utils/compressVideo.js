import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg = null


async function loadFFmpeg(onStatus) {
  if (ffmpeg?.loaded) return ffmpeg
  ffmpeg = new FFmpeg()
  onStatus?.('Loading compressor…')
  const base = window.location.origin
  await ffmpeg.load({
    coreURL: `${base}/ffmpeg-core.js`,
    wasmURL: `${base}/ffmpeg-core.wasm`,
  })
  return ffmpeg
}

export async function compressToMp4(file, { onProgress, onStatus } = {}) {
  const ff = await loadFFmpeg(onStatus)

  const progressHandler = ({ progress }) => onProgress?.(Math.min(Math.round(progress * 100), 99))
  ff.on('progress', progressHandler)

  try {
    await ff.writeFile('input.mp4', await fetchFile(file))
    await ff.exec([
      '-i', 'input.mp4',
      '-c:v', 'libx264',
      '-crf', '28',
      '-preset', 'ultrafast',
      '-c:a', 'aac',
      '-b:a', '96k',
      '-movflags', '+faststart',
      'output.mp4',
    ])

    const data = await ff.readFile('output.mp4')
    const name = file.name.replace(/\.[^.]+$/, '.mp4')
    return new File([data], name, { type: 'video/mp4' })
  } finally {
    ff.off('progress', progressHandler)
    ff.deleteFile('input.mp4').catch(() => {})
    ff.deleteFile('output.mp4').catch(() => {})
  }
}
