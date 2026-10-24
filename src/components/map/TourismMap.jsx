import {tx} from '../../i18n/index.js'
import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
const MapCanvas = lazy(() => import('./MapCanvas.jsx'))

class MapBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <div className="map-error" role="alert"><p>{tx("The interactive map could not start. Check WebGL support or reload the page. The destination list remains available.")}</p></div> : this.props.children
  }
}

// Mount WebGL only when approaching the viewport; a fixed slot prevents shifts.
export default function TourismMap(props) {
  const host = useRef(null)
  const [selection, setSelection] = useState(null)
  const controlled = typeof props.onSelect === 'function'
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window))
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { setVisible(true); observer.disconnect() } }, { rootMargin: '200px' })
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={host} className={`tourism-map ${props.compact ? 'tourism-map--compact' : ''}`} aria-label={tx("Interactive Jordan tourism map")}>
    <MapBoundary><Suspense fallback={<p className="map-loading" role="status">{tx("Preparing your Jordan map…")}</p>}>{tx(visible ? <MapCanvas {...props} selectedId={controlled ? props.selectedId : selection?.id} onSelect={controlled ? props.onSelect : setSelection} onClose={controlled ? props.onClose : () => setSelection(null)} /> : <p className="map-loading">{tx("Map loads when in view")}</p>)}</Suspense></MapBoundary>
  </div>
}
