'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseAutoSaveOptions<T> {
  key: string
  data: T
  interval?: number // milliseconds
  onSave?: (data: T) => void
  onRestore?: (data: T) => void
}

interface UseAutoSaveReturn {
  savedData: T | null
  lastSaved: Date | null
  isRestoring: boolean
  clearSaved: () => void
  hasDraft: boolean
  restoreDraft: () => T | null
}

export function useAutoSave<T>({
  key,
  data,
  interval = 5000, // Save every 5 seconds
  onSave,
  onRestore,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [savedData, setSavedData] = useState<T | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)
  const dataRef = useRef(data)
  const storageKey = `kuis_draft_${key}`

  // Update ref when data changes
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Auto-save to localStorage
  useEffect(() => {
    const saveInterval = setInterval(() => {
      try {
        const currentData = dataRef.current
        if (currentData && typeof currentData === 'object') {
          const serialized = JSON.stringify({
            data: currentData,
            timestamp: new Date().toISOString(),
          })
          localStorage.setItem(storageKey, serialized)
          setSavedData(currentData)
          setLastSaved(new Date())
          onSave?.(currentData)
        }
      } catch (error) {
        console.error('Auto-save error:', error)
      }
    }, interval)

    return () => clearInterval(saveInterval)
  }, [key, interval, storageKey, onSave])

  // Clear on successful submit
  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
      setSavedData(null)
      setLastSaved(null)
    } catch (error) {
      console.error('Clear draft error:', error)
    }
  }, [storageKey])

  // Check if draft exists
  const hasDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved !== null
    } catch {
      return false
    }
  }, [storageKey])

  // Get saved draft without restoring
  const getDraft = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.data as T
      }
    } catch (error) {
      console.error('Get draft error:', error)
    }
    return null
  }, [storageKey])

  // Restore draft
  const restoreDraft = useCallback((): T | null => {
    setIsRestoring(true)
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        const restoredData = parsed.data as T
        onRestore?.(restoredData)
        setTimeout(() => setIsRestoring(false), 500)
        return restoredData
      }
    } catch (error) {
      console.error('Restore draft error:', error)
      setIsRestoring(false)
    }
    return null
  }, [storageKey, onRestore])

  return {
    savedData,
    lastSaved,
    isRestoring,
    clearSaved,
    hasDraft: hasDraft(),
    restoreDraft,
  }
}

// Hook for quiz auto-save specifically
export function useQuizAutoSave(kuisId: string, initialAnswers: Record<string, string>) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [draftTimestamp, setDraftTimestamp] = useState<Date | null>(null)

  const storageKey = `quiz_answers_${kuisId}`

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        setDraftTimestamp(new Date(parsed.timestamp))
        setShowRestoreModal(true)
      }
    } catch {
      // No draft
    }
  }, [kuisId, storageKey])

  const autoSave = useAutoSave<Record<string, string>>({
    key: storageKey,
    data: answers,
    interval: 5000, // Save every 5 seconds
  })

  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey)
      setDraftTimestamp(null)
    } catch {
      // Ignore
    }
  }

  const restoreDraft = () => {
    const draft = autoSave.restoreDraft()
    if (draft) {
      setAnswers(draft)
      setShowRestoreModal(false)
    }
  }

  const discardDraft = () => {
    clearDraft()
    setShowRestoreModal(false)
  }

  return {
    answers,
    setAnswers,
    showRestoreModal,
    setShowRestoreModal,
    draftTimestamp,
    autoSave,
    clearDraft,
    restoreDraft,
    discardDraft,
  }
}
