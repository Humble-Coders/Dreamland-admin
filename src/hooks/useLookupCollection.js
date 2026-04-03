import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot, writeBatch, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Real-time hook for a "lookup" collection (e.g. parkingTypes).
 * Each document has a `name` field.
 *
 * If the collection is empty on first load AND `seedValues` are provided,
 * the hook will auto-seed the collection with those values.
 *
 * Returns docs sorted alphabetically by name.
 */
export default function useLookupCollection(collectionName, seedValues = []) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const hasSeeded = useRef(false)

  useEffect(() => {
    const colRef = collection(db, collectionName)
    const unsubscribe = onSnapshot(
      colRef,
      async (snap) => {
        if (snap.empty && seedValues.length > 0 && !hasSeeded.current) {
          // Auto-seed on first load if collection is empty
          hasSeeded.current = true
          try {
            const batch = writeBatch(db)
            seedValues.forEach((name) => {
              const docRef = doc(colRef)
              batch.set(docRef, { name, createdAt: serverTimestamp() })
            })
            await batch.commit()
            // onSnapshot fires again automatically after commit
          } catch (err) {
            console.error(`Seeding ${collectionName} failed:`, err)
            setLoading(false)
          }
        } else {
          setDocs(
            snap.docs
              .map((d) => ({ id: d.id, name: d.data().name }))
              .sort((a, b) => a.name.localeCompare(b.name))
          )
          setLoading(false)
        }
      },
      (err) => {
        console.error(`useLookupCollection(${collectionName}):`, err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [collectionName])

  return { docs, loading }
}
