import { useState, useRef } from 'react'
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import toast from 'react-hot-toast'

export default function Media({ data, onChange, errors }) {
  const photos = data.photos || []
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadError, setUploadError] = useState(null)
  const inputRef = useRef(null)

  async function handleFileChange(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    setProgress(0)
    setUploadError(null)

    try {
      const urls = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const storageRef = ref(storage, `hotels/${Date.now()}_${file.name}`)
        await new Promise((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, file)
          task.on(
            'state_changed',
            (snap) => {
              const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
              setProgress(pct)
            },
            (err) => {
              console.error('Storage upload error:', err.code, err.message)
              reject(err)
            },
            async () => {
              const url = await getDownloadURL(task.snapshot.ref)
              urls.push(url)
              resolve()
            }
          )
        })
      }
      onChange({ photos: [...photos, ...urls] })
      toast.success(`${urls.length} photo${urls.length > 1 ? 's' : ''} uploaded`)
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
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removePhoto(idx) {
    const next = photos.filter((_, i) => i !== idx)
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
            <ImagePlus size={32} className="text-brand-muted" />
            <div className="text-center">
              <p className="text-brand-text text-sm font-medium">Click to upload photos</p>
              <p className="text-brand-muted text-xs mt-0.5">PNG, JPG, WEBP — multiple allowed</p>
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
          accept="image/*"
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
          {photos.map((url, idx) => (
            <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden bg-brand-bg">
              <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-brand-error
                           rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100
                           transition-opacity"
              >
                <X size={12} className="text-white" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-brand-gold text-brand-bg px-1.5 py-0.5 rounded font-medium">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
