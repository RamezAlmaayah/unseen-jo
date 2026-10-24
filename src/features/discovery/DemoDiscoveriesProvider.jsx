import {tx} from '../../i18n/index.js'
import { useState } from 'react'
import { DemoDiscoveriesContext } from './DemoDiscoveriesContext'

// Deliberately in memory only. This is neither an account nor permanent storage.
export default function DemoDiscoveriesProvider({ children }) {
  const [favorites, setFavorites] = useState([])
  const [profile, setProfile] = useState({ name: 'Jordan Explorer', email: 'explorer@example.invalid' })
  function toggleFavorite(id) {
    setFavorites(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  }
  function loadSampleCollection(ids) { setFavorites(current => [...new Set([...current, ...ids])]) }
  return <DemoDiscoveriesContext.Provider value={{ favorites, toggleFavorite, loadSampleCollection, profile, updateProfile: setProfile }}>{tx(children)}</DemoDiscoveriesContext.Provider>
}
