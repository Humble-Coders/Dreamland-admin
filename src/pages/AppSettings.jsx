import { useState, useRef, useEffect } from 'react'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { Upload, X, ImagePlus, Film, Loader2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const HEADER_DOC = doc(db, 'appConfig', 'header')

export default function AppSettings() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [deleting, setDeleting] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    async function fetchMedia() {
      try {
        const snap = await getDoc(HEADER_DOC)
        if (snap.exists()) {
          setMedia(snap.data().headerMedia || [])
        }
      } catch (err) {
        toast.error('Failed to load header media')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMedia()
  }, [])

  async function handleFileChange(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    setProgress(0)

    try {
      const uploaded = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const isVideo = file.type.startsWith('video/')
        const storagePath = `appConfig/header/${Date.now()}_${file.name}`
        const storageRef = ref(storage, storagePath)

        await new Promise((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, file)
          task.on(
            'state_changed',
            (snap) => {
              const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
              setProgress(pct)
            },
            reject,
            async () => {
              const url = await getDownloadURL(task.snapshot.ref)
              uploaded.push({ url, type: isVideo ? 'video' : 'image', storagePath, name: file.name })
              resolve()
            }
          )
        })
      }

      const next = [...media, ...uploaded]
      await saveMedia(next)
      setMedia(next)
      toast.success(`${uploaded.length} file${uploaded.length > 1 ? 's' : ''} uploaded`)
    } catch (err) {
      const msg = err.code === 'storage/unauthorized'
        ? 'Permission denied — check Firebase Storage Rules'
        : err.message
      toast.error(msg)
      console.error(err)
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function removeMedia(idx) {
    setDeleting(idx)
    try {
      const item = media[idx]
      if (item.storagePath) {
        await deleteObject(ref(storage, item.storagePath)).catch(() => {})
      }
      const next = media.filter((_, i) => i !== idx)
      await saveMedia(next)
      setMedia(next)
      toast.success('Removed')
    } catch (err) {
      toast.error('Failed to remove')
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  async function saveMedia(items) {
    await setDoc(HEADER_DOC, { headerMedia: items }, { merge: true })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-brand-gold text-2xl font-bold">App Settings</h1>
        <p className="text-brand-muted text-sm mt-1">Manage global app configuration</p>
      </div>

      {/* Header Media section */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-5">
        <div className="border-b border-brand-border pb-4">
          <h2 className="text-brand-text font-semibold text-base">Header Media</h2>
          <p className="text-brand-muted text-xs mt-1">
            Images and videos displayed in the app header. Stored in{' '}
            <code className="text-brand-gold text-[11px] bg-brand-bg px-1.5 py-0.5 rounded">
              appConfig / header / headerMedia
            </code>
          </p>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
            py-8 px-4 transition-colors
            ${uploading ? 'cursor-wait border-brand-border' : 'cursor-pointer border-brand-border hover:border-brand-gold'}
          `}
        >
          {uploading ? (
            <>
              <Loader2 size={32} className="text-brand-gold animate-spin" />
              <p className="text-brand-muted text-sm">Uploading… {progress}%</p>
              <div className="w-40 h-1.5 bg-brand-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-brand-muted">
                <ImagePlus size={28} />
                <Film size={28} />
              </div>
              <div className="text-center">
                <p className="text-brand-text text-sm font-medium">Click to upload images or videos</p>
                <p className="text-brand-muted text-xs mt-0.5">JPG, PNG, WEBP, MP4, MOV — multiple allowed</p>
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
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Media grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="text-brand-gold animate-spin" />
          </div>
        ) : media.length === 0 ? (
          <p className="text-center text-brand-muted text-sm py-4">No header media yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {media.map((item, idx) => (
              <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden bg-brand-bg border border-brand-border">
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                  />
                ) : (
                  <img src={item.url} alt={item.name || `Media ${idx + 1}`} className="w-full h-full object-cover" />
                )}

                {/* Type badge */}
                <span className="absolute bottom-1 left-1 flex items-center gap-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded font-medium">
                  {item.type === 'video' ? <Film size={10} /> : <ImagePlus size={10} />}
                  {item.type}
                </span>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeMedia(idx)}
                  disabled={deleting === idx}
                  className="absolute top-1 right-1 w-7 h-7 bg-black/70 hover:bg-brand-error
                             rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100
                             transition-opacity disabled:opacity-60"
                >
                  {deleting === idx
                    ? <Loader2 size={12} className="text-white animate-spin" />
                    : <Trash2 size={12} className="text-white" />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
