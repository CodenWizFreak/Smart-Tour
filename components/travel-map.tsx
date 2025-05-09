"use client"

import { useEffect, useState } from "react"
import { SimpleMap } from "./simple-map"
import dynamic from "next/dynamic"

type Place = {
  name: string
  state?: string
  lat: number
  lng: number
}

interface TravelMapProps {
  places: Place[]
}

// Dynamically import LeafletMap with no SSR
const LeafletMapDynamic = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-900 rounded-lg">
      <p className="text-white">Loading map...</p>
    </div>
  ),
})

export function TravelMap({ places }: TravelMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Log places for debugging
  useEffect(() => {
    console.log("TravelMap received places:", places)
  }, [places])

  // If there are no places or we're not mounted yet (SSR), show the simple map as a fallback
  if (!isMounted || !places || places.length === 0) {
    return <SimpleMap places={places || []} />
  }

  return (
    <div className="h-full w-full min-h-[400px]">
      <LeafletMapDynamic places={places} />
    </div>
  )
}
