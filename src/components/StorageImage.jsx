import { useState, useEffect } from 'react'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import { BedDouble } from 'lucide-react'

/**
 * Renders an image from Firebase Storage.
 * - If `src` is already a full https:// URL (from getDownloadURL), uses it directly.
 * - If `src` is a gs:// path or a relative storage path, resolves it via getDownloadURL.
 * - Shows a skeleton while loading and a placeholder on error.
 */
export default function StorageImage({ src, alt = '', className = '', placeholderIcon }) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src) {
      setLoading(false)
      return
    }

    // Already a full HTTPS download URL — use directly
    if (src.startsWith('https://')) {
      setUrl(src)
      setLoading(false)
      return
    }

    // gs:// URI or storage path — resolve via SDK
    setLoading(true)
    setError(false)
    const storageRef = src.startsWith('gs://')
      ? ref(storage, src)
      : ref(storage, src)

    getDownloadURL(storageRef)
      .then((downloadUrl) => {
        setUrl(downloadUrl)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [src])

  if (loading) {
    return (
      <div className={`bg-brand-surface animate-pulse ${className}`} />
    )
  }

  if (error || !url) {
    return (
      <div className={`bg-brand-surface flex items-center justify-center ${className}`}>
        {placeholderIcon ?? <BedDouble size={32} className="text-brand-border" />}
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}
