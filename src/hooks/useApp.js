import { useContext } from 'react'
import { AppContext } from '../context/AppContext.js'

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider')
  }
  return context
}
