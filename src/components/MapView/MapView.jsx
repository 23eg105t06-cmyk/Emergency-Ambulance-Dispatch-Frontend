import { useEffect, useRef } from 'react'

export default function MapView({ pickupLat, pickupLng, driverLat, driverLng, showRoute }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const pickupMarkerRef = useRef(null)
  const driverMarkerRef = useRef(null)
  const routeLineRef = useRef(null)
  const initializedRef = useRef(false)

  // Step 1: Load Leaflet CSS + JS once
  useEffect(() => {
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        // Add CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }
        // Add JS
        if (window.L) { resolve(); return }
        if (document.getElementById('leaflet-js')) {
          document.getElementById('leaflet-js').addEventListener('load', resolve)
          return
        }
        const script = document.createElement('script')
        script.id = 'leaflet-js'
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = resolve
        document.head.appendChild(script)
      })
    }

    loadLeaflet().then(() => {
      if (!mapRef.current || initializedRef.current) return
      initializedRef.current = true

      const L = window.L
      const centerLat = pickupLat || 17.385
      const centerLng = pickupLng || 78.4867

      // Create map
      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
      })

      // Dark-styled OpenStreetMap tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map)

      mapInstanceRef.current = map

      // Add initial markers if coords available
      if (pickupLat && pickupLng) {
        pickupMarkerRef.current = L.marker([pickupLat, pickupLng], {
          icon: createIcon(L, '📍', '#E63946')
        }).addTo(map).bindPopup('<b>Your Pickup Location</b>')
      }

      if (driverLat && driverLng) {
        driverMarkerRef.current = L.marker([driverLat, driverLng], {
          icon: createIcon(L, '🚑', '#2ec4b6')
        }).addTo(map).bindPopup('<b>Ambulance Location</b>')
      }

      if (showRoute && pickupLat && pickupLng && driverLat && driverLng) {
        routeLineRef.current = L.polyline(
          [[driverLat, driverLng], [pickupLat, pickupLng]],
          { color: '#E63946', weight: 4, opacity: 0.9, dashArray: '8 8' }
        ).addTo(map)
        map.fitBounds([[pickupLat, pickupLng], [driverLat, driverLng]], { padding: [50, 50] })
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  // Step 2: Update markers when coordinates change
  useEffect(() => {
    const L = window.L
    const map = mapInstanceRef.current
    if (!L || !map) return

    // Update or create pickup marker
    if (pickupLat && pickupLng) {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickupLat, pickupLng])
      } else {
        pickupMarkerRef.current = L.marker([pickupLat, pickupLng], {
          icon: createIcon(L, '📍', '#E63946')
        }).addTo(map).bindPopup('<b>Your Pickup Location</b>')
      }
    }

    // Update or create driver marker
    if (driverLat && driverLng) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([driverLat, driverLng])
      } else {
        driverMarkerRef.current = L.marker([driverLat, driverLng], {
          icon: createIcon(L, '🚑', '#2ec4b6')
        }).addTo(map).bindPopup('<b>Ambulance Location</b>')
      }

      // Update route line
      if (showRoute && pickupLat && pickupLng) {
        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs([[driverLat, driverLng], [pickupLat, pickupLng]])
        } else {
          routeLineRef.current = L.polyline(
            [[driverLat, driverLng], [pickupLat, pickupLng]],
            { color: '#E63946', weight: 4, opacity: 0.9, dashArray: '8 8' }
          ).addTo(map)
        }
        map.fitBounds([[pickupLat, pickupLng], [driverLat, driverLng]], { padding: [50, 50] })
      } else {
        map.setView([driverLat, driverLng], 14)
      }
    } else if (pickupLat && pickupLng) {
      map.setView([pickupLat, pickupLng], 14)
    }
  }, [pickupLat, pickupLng, driverLat, driverLng, showRoute])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {!pickupLat && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#12121a', flexDirection: 'column', gap: 12
        }}>
          <div style={{ fontSize: 40 }}>🗺️</div>
          <div style={{ color: '#8b8fa8', fontSize: 14 }}>Waiting for location...</div>
        </div>
      )}
    </div>
  )
}

function createIcon(L, emoji, color) {
  return L.divIcon({
    html: `<div style="
      width:38px; height:38px; border-radius:50%;
      background:${color}22; border:2px solid ${color};
      display:flex; align-items:center; justify-content:center;
      font-size:20px; box-shadow:0 2px 12px ${color}44;
    ">${emoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    className: ''
  })
}