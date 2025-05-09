"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type Place = {
  name: string
  state?: string
  lat: number
  lng: number
}

interface LeafletMapProps {
  places: Place[]
}

export default function LeafletMap({ places }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("LeafletMap useEffect triggered with places:", places)
    if (!mapRef.current) return

    console.log("Initializing map with places:", places)

    // Create the map with explicit height
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      attributionControl: true,
    }).setView([20.5937, 78.9629], 5)

    // Add the tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Create a custom icon using the provided marker icon
    const customIcon = L.divIcon({
      className: "custom-marker-icon",
      html: `<div style="width: 25px; height: 41px; background-image: url('https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'); background-size: contain; background-repeat: no-repeat;"></div>`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    })

    // Color palette for different states
    const colors = [
      "#4169E1", // Royal Blue
      "#00BFFF", // Deep Sky Blue
      "#8A2BE2", // Blue Violet
      "#4B0082", // Indigo
      "#FF4500", // Red-Orange
      "#32CD32", // Lime Green
    ]

    // Group places by state
    const stateGroups: Record<string, Place[]> = {}
    places.forEach((place) => {
      const state = place.state || "Unknown"
      if (!stateGroups[state]) {
        stateGroups[state] = []
      }
      stateGroups[state].push(place)
    })

    // Add markers for each place
    const bounds = L.latLngBounds([])
    let colorIndex = 0

    Object.entries(stateGroups).forEach(([state, statePlaces]) => {
      const stateColor = colors[colorIndex % colors.length]
      colorIndex++

      statePlaces.forEach((place) => {
        // Create a colored marker for each place
        const coloredIcon = L.divIcon({
          className: "custom-marker-icon",
          html: `<div style="width: 25px; height: 41px; position: relative;">
                  <div style="width: 25px; height: 41px; background-image: url('https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'); background-size: contain; background-repeat: no-repeat; filter: drop-shadow(0 0 5px ${stateColor});"></div>
                  <div style="position: absolute; top: 8px; left: 8px; width: 8px; height: 8px; background-color: ${stateColor}; border-radius: 50%; border: 1px solid white;"></div>
                </div>`,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })

        // Add the marker
        const marker = L.marker([place.lat, place.lng], { icon: coloredIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'Montserrat', sans-serif; color: #333; text-align: center;">
              <b style="color: ${stateColor};">${place.name}</b>
              ${place.state ? `<p style="margin: 2px 0 0 0; font-size: 12px;">${place.state}</p>` : ""}
            </div>
          `)

        // Extend the bounds to include this marker
        bounds.extend([place.lat, place.lng])
      })
    })

    // Fit the map to show all markers
    if (places.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 8)
    }

    // Add CSS for the map
    const style = document.createElement("style")
    style.textContent = `
      .leaflet-container {
        height: 100%;
        width: 100%;
      }
      
      .custom-marker-icon {
        background: transparent;
        border: none;
      }
    `
    document.head.appendChild(style)

    // Force a resize to ensure the map renders correctly
    setTimeout(() => {
      map.invalidateSize()
      console.log("Map resized")
    }, 300)

    // Cleanup
    return () => {
      map.remove()
      document.head.removeChild(style)
    }
  }, [places])

  return <div ref={mapRef} className="h-full w-full" style={{ minHeight: "400px" }} />
}
