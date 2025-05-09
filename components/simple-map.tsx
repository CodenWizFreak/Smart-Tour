"use client"
import Image from "next/image"
import { MapPin } from "lucide-react"

type Place = {
  name: string
  state?: string
  lat: number
  lng: number
}

interface SimpleMapProps {
  places: Place[]
}

export function SimpleMap({ places }: SimpleMapProps) {
  // Group places by state
  const placesByState = places.reduce(
    (acc, place) => {
      const state = place.state || "Unknown"
      if (!acc[state]) {
        acc[state] = []
      }
      acc[state].push(place)
      return acc
    },
    {} as Record<string, Place[]>,
  )

  // Color palette for different states
  const colors = [
    "#4169E1", // Royal Blue
    "#00BFFF", // Deep Sky Blue
    "#8A2BE2", // Blue Violet
    "#4B0082", // Indigo
    "#FF4500", // Red-Orange
    "#32CD32", // Lime Green
  ]

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-900 rounded-b-lg overflow-hidden">
      {/* Static map image */}
      <div className="absolute inset-0 w-full h-full opacity-50">
        <Image src="/placeholder.svg?height=600&width=800" alt="Map of India" fill className="object-cover" />
      </div>

      {/* Map overlay with places */}
      <div className="absolute inset-0 p-4">
        <h3 className="text-white font-medium mb-4">Recommended Destinations ({places.length})</h3>

        {places.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
            {Object.entries(placesByState).map(([state, statePlaces], stateIndex) => (
              <div key={state} className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <h4 className="font-medium text-white mb-2">{state}</h4>
                <ul className="space-y-2">
                  {statePlaces.map((place, placeIndex) => (
                    <li key={`${place.name}-${placeIndex}`} className="flex items-center gap-2">
                      <span
                        className="flex-shrink-0 w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: colors[stateIndex % colors.length] }}
                      />
                      <span className="text-white text-sm">{place.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-white/70">
            <MapPin className="h-8 w-8 mb-2 opacity-50" />
            <p>No destinations found. Please try a different query.</p>
          </div>
        )}
      </div>
    </div>
  )
}
