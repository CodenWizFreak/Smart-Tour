"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import Leaflet with no SSR to avoid "window is not defined" errors
const LeafletMapForHeatmap = dynamic(() => import("./leaflet-map-for-heatmap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-900 rounded-lg">
      <p className="text-white">Loading heatmap...</p>
    </div>
  ),
})

export default function HeatmapComponent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900 rounded-lg">
        <p className="text-white">Loading heatmap...</p>
      </div>
    )
  }

  return <LeafletMapForHeatmap />
}
