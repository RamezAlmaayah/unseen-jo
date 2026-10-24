import { useCallback, useEffect, useState } from 'react'

export function useDemoDestinations(enabled = true) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ status: 'loading', destinations: [], error: null })
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch('/data/demo-destinations.json', { signal: controller.signal })
        if (!response.ok) throw new Error('The local demo dataset could not be loaded.')
        const data = await response.json()
        if (!Array.isArray(data) || data.length === 0 || data.some(place =>
          !place || typeof place.id !== 'string' || typeof place.name !== 'string' ||
          typeof place.categoryId !== 'string' || typeof place.category !== 'string' ||
          (place.image !== null && (typeof place.image !== 'string' || !place.image.startsWith('/assets/figma/'))) ||
          !Number.isFinite(place.costJod) || place.costJod < 0 ||
          typeof place.durationLabel !== 'string' || (place.travelLabel != null && typeof place.travelLabel !== 'string') ||
          (place.durationMinutes != null && (!Array.isArray(place.durationMinutes) || place.durationMinutes.length !== 2 ||
          !place.durationMinutes.every(value => Number.isFinite(value) && value >= 0) ||
          place.durationMinutes[0] > place.durationMinutes[1]))
        ) || new Set(data.map(place => place.id)).size !== data.length) throw new Error('The local demo dataset has an invalid format.')
        if (!controller.signal.aborted) setState({ status: 'ready', destinations: data, error: null })
      } catch (error) {
        if (!controller.signal.aborted) setState({ status: 'error', destinations: [], error: error.message })
      }
    }
    load()
    return () => controller.abort()
  }, [attempt, enabled])
  const retry = useCallback(() => {
    setState({ status: 'loading', destinations: [], error: null })
    setAttempt(value => value + 1)
  }, [])
  return { ...state, retry }
}
