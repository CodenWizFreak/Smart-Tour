"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export default function LeafletMapForHeatmap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load the leaflet.heat script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script is already loaded
    if (document.querySelector('script[src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"]')) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"
    script.async = true
    script.onload = () => {
      console.log("Heatmap script loaded successfully")
      setScriptLoaded(true)
    }
    script.onerror = (e) => {
      console.error("Error loading heatmap script:", e)
    }
    document.head.appendChild(script)

    return () => {
      // Optional cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Initialize map and add heatmap after script is loaded
  useEffect(() => {
    if (!mapRef.current || !scriptLoaded) return

    console.log("Initializing heatmap...")

    // Create map instance
    const map = L.map(mapRef.current, {
      center: [22.5937, 78.9629], // Center of India
      zoom: 5,
      attributionControl: true,
    })
    
    // Store map instance for cleanup
    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map)

    // Mock heatmap data - [lat, lng, intensity]
    const heatData = [
      // Red areas (high intensity)
      // Himachal Pradesh
      [31.1048, 77.1734, 1.0],
      [32.0842, 77.5719, 0.95],
      [31.9526, 77.1097, 0.9],

      // Kashmir
      [34.0837, 74.7973, 1.0],
      [34.17, 74.8, 0.95],
      [33.9456, 74.6053, 0.9],

      // Goa
      [15.2993, 73.9322, 1.0],
      [15.5252, 73.7669, 0.95],
      [15.3004, 73.8, 0.9],

      // Puri
      [19.8133, 85.8314, 1.0],
      [19.8, 85.85, 0.95],
      [19.79, 85.82, 0.9],

      // Darjeeling
      [27.041, 88.2663, 1.0],
      [27.036, 88.2627, 0.95],
      [27.029, 88.263, 0.9],

      // Yellow areas (medium intensity)
      // Assam
      [26.2006, 92.9376, 0.7],
      [26.1433, 91.7898, 0.65],
      [26.7509, 94.2037, 0.6],

      // Meghalaya
      [25.467, 91.3662, 0.7],
      [25.5788, 91.8933, 0.65],
      [25.3, 91.7, 0.6],

      // Chennai
      [13.0827, 80.2707, 0.7],
      [13.1, 80.3, 0.65],
      [13.05, 80.25, 0.6],

      // Bangalore
      [12.9716, 77.5946, 0.7],
      [13.0, 77.6, 0.65],
      [12.95, 77.55, 0.6],

      // Mumbai
      [19.076, 72.8777, 0.7],
      [19.1136, 72.8697, 0.65],
      [19.0, 72.83, 0.6],

      // Indore
      [22.7196, 75.8577, 0.7],
      [22.75, 75.9, 0.65],
      [22.7, 75.8, 0.6],
    ]

    // Add some low intensity points to ensure the full gradient spectrum is visible
    const lowIntensityPoints = [
      // Low intensity (blue) areas
      [27.5929, 81.4603, 0.3], // Uttar Pradesh
      [27.6909, 81.9602, 0.25],
      [27.4909, 81.5603, 0.2],

      [23.2156, 77.4068, 0.3], // Madhya Pradesh
      [23.3156, 77.5068, 0.25],
      [23.1156, 77.3068, 0.2],

      [21.2514, 81.6296, 0.3], // Chhattisgarh
      [21.3514, 81.7296, 0.25],
      [21.1514, 81.5296, 0.2],
    ]

    // Combine all points
    const allHeatData = [...heatData, ...lowIntensityPoints]

    try {
      // Check if L.heatLayer is available
      if (typeof (L as any).heatLayer === "function") {
        const heatLayer = (L as any)
          .heatLayer(allHeatData, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            max: 1.0, // Maximum intensity value
            // Define a clear gradient with more color stops
            gradient: {
              0.1: "blue",
              0.3: "cyan",
              0.5: "lime",
              0.7: "yellow",
              0.8: "orange",
              0.9: "red",
            },
          })
          .addTo(map)
        console.log("Heatmap layer added successfully")
      } else {
        console.error("L.heatLayer is not available even after script loaded")
      }

      // Add legend
      const legend = new L.Control({ position: 'bottomright' })
      
      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend")
        div.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
        div.style.padding = "10px"
        div.style.borderRadius = "5px"
        div.style.color = "white"
        div.style.fontFamily = "Montserrat, sans-serif"

        // Updated gradient legend with all colors
        div.innerHTML = `
          <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Popularity</h4>
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; align-items: center;">
              <span style="display: inline-block; width: 20px; height: 20px; background: red; margin-right: 5px;"></span>
              <span>High</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="display: inline-block; width: 20px; height: 20px; background: orange; margin-right: 5px;"></span>
              <span>Medium-High</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="display: inline-block; width: 20px; height: 20px; background: yellow; margin-right: 5px;"></span>
              <span>Medium</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="display: inline-block; width: 20px; height: 20px; background: lime; margin-right: 5px;"></span>
              <span>Medium-Low</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="display: inline-block; width: 20px; height: 20px; background: cyan; margin-right: 5px;"></span>
              <span>Low</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="display: inline-block; width: 20px; height: 20px; background: blue; margin-right: 5px;"></span>
              <span>Very Low</span>
            </div>
          </div>
        `

        return div
      }
      
      legend.addTo(map)

      // Force a resize to ensure the map renders correctly
      setTimeout(() => {
        map.invalidateSize()
      }, 100)
      
      console.log("Heatmap initialized successfully")
    } catch (error) {
      console.error("Error initializing heatmap:", error)
    }

    // Cleanup function
    return () => {
      console.log("Cleaning up heatmap...")
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [scriptLoaded]) // Only run when script is loaded

  return (
    <div
      ref={mapRef}
      className="h-full w-full rounded-lg overflow-hidden"
      style={{ minHeight: "500px" }} // Increased minimum height for better visibility
    />
  )
}