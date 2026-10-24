import { useCallback, useEffect, useRef, useState } from 'react'
import { hasCoordinates } from './geography.js'

export const locationError = code => code === 1 ? 'Location permission was denied. You can choose a city instead.'
  : code === 3 ? 'Location took too long. Try again or choose a city.' : 'Your position is unavailable. Try again or choose a city.'

// One user-initiated reading; no watchPosition, storage, logging or server send.
export function useLocation(onChange) {
  const [state, setState] = useState({ status: 'idle', origin: null, message: '' })
  const request = useRef(0)
  useEffect(() => () => { request.current++ }, [])
  const clear = useCallback(() => { request.current++; onChange?.(null); setState({ status: 'idle', origin: null, message: '' }) }, [onChange])
  const chooseCity = useCallback(city => {
    request.current++
    onChange?.(null)
    if (hasCoordinates(city)) setState({ status: 'ready', origin: { ...city, kind: 'city' }, message: `${city.name} city centre · approximate, not your GPS position.` })
  }, [onChange])
  const locate = useCallback(() => {
    const id = ++request.current
    onChange?.(null)
    if (!window.isSecureContext) return setState({ status: 'error', origin: null, message: 'Location needs HTTPS or localhost. Choose a city instead.' })
    if (!navigator.geolocation) return setState({ status: 'error', origin: null, message: 'This browser does not support location. Choose a city instead.' })
    setState({ status: 'loading', origin: null, message: 'Waiting for your location permission…' })
    navigator.geolocation.getCurrentPosition(position => {
      if (request.current !== id) return
      const origin = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, kind: 'gps' }
      setState(hasCoordinates(origin) ? { status: 'ready', origin, message: `Current GPS reading · accuracy about ${Math.round(origin.accuracy)} m. Distances are approximate straight-line distances.` }
        : { status: 'error', origin: null, message: 'The location reading is outside supported map coordinates. Choose a city instead.' })
    }, error => { if (request.current === id) setState({ status: 'error', origin: null, message: locationError(error.code) }) },
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 0 })
  }, [onChange])
  return { ...state, locate, chooseCity, clear }
}
