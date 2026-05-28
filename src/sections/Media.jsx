import { useState, useRef, useEffect } from 'react'
import { Upload, X, ImagePlus, Loader2, Star } from 'lucide-react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import toast from 'react-hot-toast'
import { compressToMp4 } from '../utils/compressVideo'

function isVideoUrl(url) {
  try {
    const path = decodeURIComponent(new URL(url).pathname)
    return /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(path)
  } catch {
    return false
  }
}

export default function Media({ data, onChange, errors }) {
  const photos = data.photos || []
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [uploadError, setUploadError] = useState(null)
  const inputRef = useRef(null)
  const didSort = useRef(false)

  useEffect(() => {
    if (didSort.current || photos.length === 0 || !isVideoUrl(photos[0])) return
    didSort.current = true
    const images = photos.filter((u) => !isVideoUrl(u))
    const videos = photos.filter((u) => isVideoUrl(u))
    if (images.length > 0) onChange({ photos: [...images, ...videos] })
  }, [photos]) // eslint-disable-line

  async function handleFileChange(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const invalidVideos = files.filter((f) => f.type.startsWith('video/') && f.type !== 'video/mp4')
    if (invalidVideos.length) {
      toast.error('Only MP4 videos are allowed')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setUploading(true)
    setProgress(0)
    setUploadError(null)

    try {
      const urls = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const isVideo = file.type === 'video/mp4'

        let uploadFile = file
        if (isVideo) {
          try {
            uploadFile = await compressToMp4(file, {
              onStatus: (msg) => setUploadStatus(`${msg} (${i + 1}/${files.length})`),
              onProgress: (p) => { setProgress(Math.round(p * 0.6)); setUploadStatus(`Compressing ${i + 1}/${files.length}…`) },
            })
          } catch (compressErr) {
            console.error('Video compression failed:', compressErr)
            toast('Compression unavailable — uploading original', { icon: '⚠️' })
          }
        }

        setUploadStatus(`Uploading ${i + 1}/${files.length}…`)
        const storageRef = ref(storage, `hotels/${Date.now()}_${uploadFile.name}`)
        await new Promise((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, uploadFile)
          task.on(
            'state_changed',
            (snap) => {
              const base = isVideo ? 60 : 0
              const range = isVideo ? 40 : 100
              setProgress(base + Math.round((snap.bytesTransferred / snap.totalBytes) * range))
            },
            reject,
            async () => {
              const url = await getDownloadURL(task.snapshot.ref)
              urls.push(url)
              resolve()
            }
          )
        })
      }

      const merged = [...photos, ...urls]
      const sorted = [
        ...merged.filter((u) => !isVideoUrl(u)),
        ...merged.filter((u) => isVideoUrl(u)),
      ]
      onChange({ photos: sorted })
      toast.success(`${urls.length} file${urls.length > 1 ? 's' : ''} uploaded`)
    } catch (err) {
      const isPermission = err.code === 'storage/unauthorized'
      const msg = isPermission
        ? 'Permission denied — update Firebase Storage Rules to allow writes (see instructions below)'
        : err.message
      setUploadError({ message: msg, isPermission })
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
      setUploadStatus('')
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeMedia(idx) {
    onChange({ photos: photos.filter((_, i) => i !== idx) })
  }

  function setCover(idx) {
    if (idx === 0) return
    if (isVideoUrl(photos[idx])) return
    const next = [...photos]
    const [item] = next.splice(idx, 1)
    next.unshift(item)
    onChange({ photos: next })
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
          py-8 px-4 cursor-pointer transition-colors
          ${errors?.photos ? 'border-brand-error' : 'border-brand-border hover:border-brand-gold'}
          ${uploading ? 'cursor-wait' : ''}
        `}
      >
        {uploading ? (
          <>
            <Loader2 size={32} className="text-brand-gold animate-spin" />
            <p className="text-brand-muted text-sm">{uploadStatus || 'Processing…'} {progress}%</p>
            <div className="w-40 h-1.5 bg-brand-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-gold rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <ImagePlus size={32} className="text-brand-muted" />
            <div className="text-center">
              <p className="text-brand-text text-sm font-medium">Click to upload photos or videos</p>
              <p className="text-brand-muted text-xs mt-0.5">PNG, JPG, WEBP, MP4 — multiple allowed</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 rounded-lg">
              <Upload size={14} className="text-brand-gold" />
              <span className="text-brand-gold text-xs font-medium">Choose files</span>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {errors?.photos && (
        <p className="text-brand-error text-xs -mt-2">{errors.photos}</p>
      )}

      {uploadError && (
        <div className="bg-brand-error/10 border border-brand-error/40 rounded-xl p-4 space-y-2">
          <p className="text-brand-error text-sm font-medium">{uploadError.message}</p>
          {uploadError.isPermission && (
            <div className="text-brand-muted text-xs space-y-1">
              <p className="font-medium text-brand-text">Fix: Update your Firebase Storage Rules</p>
              <p>Go to <span className="text-brand-gold">Firebase Console → Storage → Rules</span> and replace with:</p>
              <pre className="bg-brand-bg rounded-lg p-3 text-brand-gold text-xs overflow-x-auto mt-1">{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}`}</pre>
              <p className="text-brand-warning">Note: This allows open access — add auth rules before going to production.</p>
            </div>
          )}
        </div>
      )}

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, idx) => {
            const isVid = isVideoUrl(url)
            const isCover = idx === 0
            return (
              <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden bg-brand-bg">
                {isVid ? (
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    onMouseEnter={(e) => { e.currentTarget.play().catch(() => {}) }}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause()
                      e.currentTarget.currentTime = 0
                    }}
                  />
                ) : (
                  <img src={url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeMedia(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-brand-error
                             rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100
                             transition-opacity"
                >
                  <X size={12} className="text-white" />
                </button>

                {/* Video label */}
                {isVid && (
                  <span className="absolute top-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Video
                  </span>
                )}

                {/* Cover badge / Set Cover button — videos are excluded */}
                {isCover && !isVid ? (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-brand-gold text-brand-bg px-1.5 py-0.5 rounded font-medium">
                    Cover
                  </span>
                ) : !isCover && !isVid ? (
                  <button
                    type="button"
                    onClick={() => setCover(idx)}
                    className="absolute bottom-1 left-1 flex items-center gap-1 text-[10px]
                               bg-black/60 hover:bg-brand-gold text-white hover:text-brand-bg
                               px-1.5 py-0.5 rounded font-medium opacity-0 group-hover:opacity-100
                               transition-all"
                  >
                    <Star size={9} />
                    Set Cover
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
