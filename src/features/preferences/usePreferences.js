import { useContext } from 'react'
import { PreferencesContext } from './context'

export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences requires PreferencesProvider')
  return value
}
