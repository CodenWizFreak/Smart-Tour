"use client"

import Image from "next/image"

export function TravelHeatmap() {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden">
      {/* Static heatmap image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/placeholder.svg?height=600&width=800"
          alt="Travel Heatmap"
          fill
          className="object-cover opacity-70"
        />
      </div>

      {/* Overlay with legend */}
      <div className="absolute bottom-4 right-4 bg-black/70 p-3 rounded-lg">
        <h4 className="text-white text-sm font-medium mb-2">Popularity</h4>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-blue-500 rounded-sm"></span>
          <span className="text-white text-xs">Most Recommendations</span>
        </div>
      </div>
    </div>
  )
}
