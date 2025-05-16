"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Send, MapPin, Loader2 } from "lucide-react"
import Image from "next/image"
import { ChatMessage } from "@/components/chat-message"
import { TravelMap } from "@/components/travel-map"
import { CursorTrail } from "@/components/cursor-trail"
import { FloatingOrbs } from "@/components/floating-orbs"
import { motion } from "framer-motion"
import "../leaflet.css" // Import Leaflet CSS

type Message = {
role: "user" | "assistant"
content: string
}

type Place = {
name: string
state?: string
lat: number
lng: number
}

const questions = [
"What kind of place do you want to visit? Mountain, Beach, Historical, City, Village, etc.",
"What is your budget in INR? Example: 30k",
"What month or season do you want to visit in? Example July or Monsoon",
"Where will you be travelling from?",
]

export default function ChatPage() {
const router = useRouter()
const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState("")
const [currentStep, setCurrentStep] = useState(0)
const [isLoading, setIsLoading] = useState(false)
const [extractedData, setExtractedData] = useState({
placeType: "",
budget: "",
season: "",
source: "",
})
const [places, setPlaces] = useState<Place[]>([])
const [showMap, setShowMap] = useState(false)
const [mapId, setMapId] = useState(0) // Add a map ID to force re-render
const [askForMore, setAskForMore] = useState(false)
const [mapLoading, setMapLoading] = useState(false)
const messagesEndRef = useRef<HTMLDivElement>(null)

// Initialize chat with first question
useEffect(() => {
setMessages([
{
role: "assistant",
content: "👋 Hi! I'm your Smart Tour travel guide! " + questions[0],
},
])
}, [])

// Scroll to bottom of chat
useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}, [messages])

const validateInput = (input: string, step: number) => {
if (!input.trim() || input.toLowerCase() === "don't know" || input.toLowerCase() === "dont know") {
// Return appropriate error message based on the current step
switch (step) {
case 0:
return "Please specify what kind of place you want to visit (Mountain, Beach, Historical, etc.)."
case 1:
return "Please provide a valid budget in INR."
case 2:
return "Please specify when you want to travel (month or season)."
case 3:
return "Please specify where you will be traveling from."
default:
return "Please provide a valid response."
}
}

// Check if the input is relevant to the current question  
switch (step) {  
  case 0: // Place type  
    const placeTypes = [  
      "mountain",  
      "beach",  
      "historical",  
      "city",  
      "village",  
      "adventure",  
      "hill",  
      "desert",  
      "forest",  
      "wildlife",  
      "pilgrimage",  
      "romantic",  
      "urban",  
      "fun",  
      "romantic",  
      "honeymoon",  
      "museum",  
      "local",  
      "educational",  
    ]  
    if (!placeTypes.some((type) => input.toLowerCase().includes(type))) {  
      return "Please specify a valid place type like Mountain, Beach, Historical, City, etc."  
    }  
    break  
  case 1: // Budget  
  if (!input.toLowerCase().match(/\b(\d+k|\d{1,3}(?:,\d{3})|\d+)\s(inr|rs)?\b/)) {  
    return "Please provide a valid budget in INR format (e.g., 500, 30k, 30,000, 30000 INR).";  
  }  
  break;  

  case 2: // Season  
    const seasons = [  
      "summer",  
      "winter",  
      "monsoon",  
      "spring",  
      "autumn",  
      "fall",  
      "rainy",  
      "january",  
      "february",  
      "march",  
      "april",  
      "may",  
      "june",  
      "july",  
      "august",  
      "september",  
      "october",  
      "november",  
      "december",  
    ]  
    if (!seasons.some((season) => input.toLowerCase().includes(season))) {  
      return "Please specify a valid season or month (e.g., Summer, Winter, July, December)."  
    }  
    break  
  case 3: // Source  
    // Basic check for Indian city names  
    const majorCities = [  
      "delhi",  
      "mumbai",  
      "kolkata",  
      "chennai",  
      "bangalore",  
      "hyderabad",  
      "ahmedabad",  
      "pune",  
      "jaipur",  
      "lucknow",  
      "kanpur",  
      "nagpur",  
      "indore",  
      "thane",  
      "bhopal",  
    ]  
    if (!majorCities.some((city) => input.toLowerCase().includes(city))) {  
      // Not a strict validation, just a warning  
      if (input.length < 3) {  
        return "Please provide a valid city name you'll be traveling from."  
      }  
    }  
    break  
}  

return null // No error

}

const handleSend = async () => {
if (!input.trim()) return

// Add user message  
const userMessage = { role: "user" as const, content: input }  
setMessages((prev) => [...prev, userMessage])  
setInput("")  
setIsLoading(true)  

// Handle the "Do you need more recommendations?" question  
if (askForMore) {  
  setAskForMore(false)  

  if (input.toLowerCase().includes("yes")) {  
    // Reset to the first question and start over  
    setCurrentStep(0)  
    setShowMap(false) // Hide the previous map  
    setTimeout(() => {  
      setMessages((prev) => [...prev, { role: "assistant", content: questions[0] }])  
      setIsLoading(false)  
    }, 1000)  
  } else {  
    // End the conversation  
    setTimeout(() => {  
      setMessages((prev) => [  
        ...prev,  
        {  
          role: "assistant",  
          content:  
            "Thank you for using Smart Tour! I hope you found the recommendations helpful. Feel free to come back anytime you're planning your next adventure!",  
        },  
      ])  
      setIsLoading(false)  
    }, 1000)  
  }  
  return  
}  

// Validate user input for the regular flow  
const validationError = validateInput(input, currentStep)  
if (validationError) {  
  // Add assistant message with the error  
  setMessages((prev) => [...prev, { role: "assistant", content: validationError }])  
  setInput("")  
  setIsLoading(false)  
  return  
}  

// Process user input based on current step  
let nextStep = currentStep  
const updatedData = { ...extractedData }  
let responseMessage = ""  

// Extract data based on current question  
if (currentStep === 0) {  
  // Extract place type  
  updatedData.placeType = input.toLowerCase()  
  nextStep = 1  
  responseMessage = questions[1]  
} else if (currentStep === 1) {  
  // Extract budget  
  updatedData.budget = input.toLowerCase()  
  nextStep = 2  
  responseMessage = questions[2]  
} else if (currentStep === 2) {  
  // Extract season  
  updatedData.season = input.toLowerCase()  
  nextStep = 3  
  responseMessage = questions[3]  
} else if (currentStep === 3) {  
  // Extract source  
  updatedData.source = input.toLowerCase()  
  nextStep = 4  

  // Call the API to get recommendations  
  try {  
    setMapLoading(true)  
    const response = await fetch("/api/recommendations", {  
      method: "POST",  
      headers: {  
        "Content-Type": "application/json",  
      },  
      body: JSON.stringify({  
        placeType: updatedData.placeType,  
        budget: updatedData.budget,  
        season: updatedData.season,  
        source: updatedData.source,  
      }),  
    })  

    if (!response.ok) {  
      throw new Error("Failed to get recommendations")  
    }  

    const data = await response.json()  

    // Log the places we received for debugging  
    console.log("Received places from API:", data.places)  

    // Add the recommendations message without the extracted places debug info  
    setMessages((prev) => [  
      ...prev,  
      {  
        role: "assistant",  
        content: data.recommendations,  
      },  
    ])  

    // Only show map if we have places  
    if (data.places && data.places.length > 0) {  
      // Generate a new map ID to force re-render  
      setMapId((prevId) => prevId + 1)  
      setPlaces(data.places)  
      setShowMap(true)  
      console.log("Setting showMap to true with places:", data.places)  
    } else {  
      console.warn("No places received from API")  
      // Use default places if none were received - this should no longer happen with our fixes  
      const defaultPlaces = [  
        { name: "Shantiniketan", state: "West Bengal", lat: 23.6773, lng: 87.6838 },  
        { name: "Raghurajpur", state: "Odisha", lat: 20.4162, lng: 85.8266 },  
        { name: "Nalanda", state: "Bihar", lat: 25.1367, lng: 85.4458 },  
        { name: "Netarhat", state: "Jharkhand", lat: 23.4842, lng: 84.2675 },  
        { name: "Mawlynnong", state: "Meghalaya", lat: 25.2031, lng: 91.9182 },  
      ]  
      setPlaces(defaultPlaces)  
      setShowMap(true)  
      console.log("Using default places for map")  
    }  

    setMapLoading(false)  

    // After a short delay, ask if they want more recommendations  
    setTimeout(() => {  
      setMessages((prev) => [...prev, { role: "assistant", content: "Do you need more recommendations? (yes/no)" }])  
      setAskForMore(true)  
      setIsLoading(false)  
    }, 2000)  

    return  
  } catch (error) {  
    console.error("Error getting recommendations:", error)  
    setMapLoading(false)  
    let errorMessage = "I'm sorry, I couldn't generate recommendations at this time. Please try again later."  

    // If we have a more specific error message, show it  
    if (error instanceof Error) {  
      errorMessage =  
        "I'm having trouble connecting to my travel database right now. Please try again in a few moments."  
    }  

    setMessages((prev) => [  
      ...prev,  
      {  
        role: "assistant",  
        content: errorMessage,  
      },  
    ])  
    setIsLoading(false)  
    return  
  }  
}  

// Update state  
setExtractedData(updatedData)  
setCurrentStep(nextStep)  

// Add assistant response for steps 0-2  
if (nextStep < 4) {  
  setTimeout(() => {  
    setMessages((prev) => [...prev, { role: "assistant", content: responseMessage }])  
    setIsLoading(false)  
  }, 1000)  
}

}

return (
<main className="relative min-h-screen flex flex-col">
<CursorTrail />
<FloatingOrbs />

<header className="p-4 border-b border-white/10 flex items-center sticky top-0 bg-background/80 backdrop-blur-md z-20">  
    <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-4">  
      <ArrowLeft className="h-5 w-5" />  
    </Button>  
    <div className="flex items-center gap-3">  
      <div className="relative w-10 h-10 overflow-hidden rounded-full border border-secondary shadow-md shadow-secondary/20">  
        <Image src="/images/logo-compass.png" alt="Smart Tour Logo" fill className="object-cover" />  
      </div>  
      <div className="relative h-8 w-32">  
        <Image src="/images/logo-text.png" alt="Smart Tour" fill className="object-contain" />  
      </div>  
    </div>  
  </header>  

  <div className="flex flex-1 overflow-hidden">  
    <div className="flex-1 flex flex-col h-[calc(100vh-73px)]">  
      <div className="flex-1 overflow-y-auto p-4">  
        <div className="max-w-3xl mx-auto">  
          {messages.map((message, index) => (  
            <motion.div  
              key={index}  
              initial={{ opacity: 0, y: 10 }}  
              animate={{ opacity: 1, y: 0 }}  
              transition={{ duration: 0.3 }}  
            >  
              <ChatMessage message={message} />  
            </motion.div>  
          ))}  

          {isLoading && (  
            <div className="flex items-center gap-2 text-muted-foreground mt-4">  
              <div className="animate-pulse">Thinking</div>  
              <div className="flex gap-1">  
                <div  
                  className="w-1 h-1 rounded-full bg-current animate-bounce"  
                  style={{ animationDelay: "0ms" }}  
                ></div>  
                <div  
                  className="w-1 h-1 rounded-full bg-current animate-bounce"  
                  style={{ animationDelay: "150ms" }}  
                ></div>  
                <div  
                  className="w-1 h-1 rounded-full bg-current animate-bounce"  
                  style={{ animationDelay: "300ms" }}  
                ></div>  
              </div>  
            </div>  
          )}  

          {mapLoading && (  
            <motion.div  
              initial={{ opacity: 0, y: 20 }}  
              animate={{ opacity: 1, y: 0 }}  
              transition={{ duration: 0.5 }}  
              className="mt-6 mb-6"  
            >  
              <Card className="overflow-hidden border border-white/10 bg-card/50 backdrop-blur-sm">  
                <CardContent className="p-0">  
                  <div className="flex items-center justify-between p-4 border-b border-white/10">  
                    <h3 className="font-medium flex items-center gap-2 text-gradient">  
                      <MapPin className="h-4 w-4" />  
                      Finding Destinations...  
                    </h3>  
                  </div>  
                  <div className="h-[400px] w-full flex items-center justify-center">  
                    <div className="flex flex-col items-center gap-4">  
                      <Loader2 className="h-8 w-8 animate-spin text-secondary" />  
                      <p className="text-muted-foreground">Mapping your destinations...</p>  
                    </div>  
                  </div>  
                </CardContent>  
              </Card>  
            </motion.div>  
          )}  

          {showMap && !mapLoading && places.length > 0 && (  
            <motion.div  
              key={map-${mapId}}  
              initial={{ opacity: 0, y: 20 }}  
              animate={{ opacity: 1, y: 0 }}  
              transition={{ duration: 0.5 }}  
              className="mt-6 mb-6"  
            >  
              <Card className="overflow-hidden border border-white/10 bg-card/50 backdrop-blur-sm">  
                <CardContent className="p-0">  
                  <div className="flex items-center justify-between p-4 border-b border-white/10">  
                    <h3 className="font-medium flex items-center gap-2 text-gradient">  
                      <MapPin className="h-4 w-4" />  
                      Recommended Destinations ({places.length})  
                    </h3>  
                  </div>  
                  <div className="h-[400px] w-full">  
                    <TravelMap places={places} />  
                  </div>  
                </CardContent>  
              </Card>  
            </motion.div>  
          )}  

          <div ref={messagesEndRef} />  
        </div>  
      </div>  

      <div className="border-t border-white/10 p-4 bg-background/80 backdrop-blur-md">  
        <div className="max-w-3xl mx-auto">  
          <div className="flex gap-2">  
            <Textarea  
              value={input}  
              onChange={(e) => setInput(e.target.value)}  
              placeholder="Type your message..."  
              className="resize-none bg-muted/50 border-white/10"  
              rows={1}  
              onKeyDown={(e) => {  
                if (e.key === "Enter" && !e.shiftKey) {  
                  e.preventDefault()  
                  handleSend()  
                }  
              }}  
            />  
            <Button  
              onClick={handleSend}  
              disabled={isLoading || !input.trim()}  
              className="bg-gradient from-primary to-secondary hover:opacity-90"  
            >  
              <Send className="h-4 w-4" />  
            </Button>  
          </div>  
        </div>  
      </div>  
    </div>  
  </div>  
</main>  
)

}

show invalid option for negative budget value or less than 50 rupees. User has to enter again.
