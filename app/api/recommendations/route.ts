import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { placeType, budget, season, source } = await request.json()

    // Validate input
    if (!placeType || !budget || !season || !source) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Check for environment variable
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    // Create a prompt for Gemini
    const prompt = `
You are a travel advisor specializing in Indian tourism. 
Suggest 5 specific destinations in India for ${placeType} places with a budget of ${budget} INR to visit in ${season} from ${source}.

Format your response as follows:

Start with a brief introduction paragraph.

Then list 5 destinations in this format:
1. State Name (Specific places/cities/towns/villages inside parentheses)
• Special: Brief description of what makes this destination special.
• Attractions: Key attractions to visit.
• Budget Considerations: Information about costs.
• Best Season: When to visit and current conditions.
• Ideal Days: Recommended length of stay.
• Travel from ${source}: How to get there.

2. Next Destination(Specific places)
...and so on.

After listing all 5 destinations, include:
• Budget Breakdown (Approximate for 7 Days): with categories like Transportation, Accommodation, Food, etc.
• Travel Tips for ${season}: practical advice for travelers.

IMPORTANT: Make sure to use proper bullet points (•) and avoid using ** or <strong> tags for formatting.
`

    // List of models to try in order
    const models = ["gemini-2.0-flash"]
    let response = null
    let errorData = null

    // Try each model until one works
    for (const model of models) {
      try {
        response = await fetch(
          https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey},
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              tools:[{
              "google_search": {}
          }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
              },
            }),
          },
        )

        if (response.ok) {
          break // If successful, exit the loop
        } else {
          errorData = await response.json()
          console.error(`Gemini API error with model ${model}:`, errorData)
        }
      } catch (error) {
        console.error(`Error with model ${model}:`, error)
      }
    }

    // If all models failed
    if (!response || !response.ok) {
      return NextResponse.json(
        { error: "Failed to get response from Gemini API after trying multiple models" },
        { status: 500 },
      )
    }

    const data = await response.json()

    // Extract the text from the response
    const recommendations = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Extract places for the map
    const places = await extractPlacesFromResponse(recommendations)

    // Log the places for debugging
    console.log("Extracted places:", places)

    return NextResponse.json({
      recommendations,
      places,
    })
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}

// Improved extractPlacesFromResponse function for better extraction of locations
async function extractPlacesFromResponse(response: string) {
  try {
    console.log("Raw response from Gemini:", response)

    // Split the response into lines
    const lines = response.split("\n")
    const places = []

    // Look for lines that match the pattern: number followed by state name and places in parentheses
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip empty lines
      if (!line) continue

      // Check if this line starts with a number followed by a period (like "1.")
      if (/^\d+\./.test(line)) {
        console.log("Found numbered line:", line)

        // Try to extract state and places
        // Look for text in parentheses
        const parenthesesMatch = line.match(/\(([^)]+)\)/)

        if (parenthesesMatch) {
          // Extract the state name (everything before the parentheses)
          const stateMatch = line.match(/^\d+\.\s*([^(]+)/)
          const stateName = stateMatch ? stateMatch[1].trim() : "Unknown"

          // Extract places from inside the parentheses
          const placesText = parenthesesMatch[1].trim()
          console.log(`Found state "${stateName}" with places text: "${placesText}"`)

          // Extract individual places with improved pattern matching
          const placesList = extractIndividualPlaces(placesText)
          console.log("Parsed places:", placesList)

          // Get coordinates for each place
          for (const placeName of placesList) {
            try {
              // Try to get coordinates from OpenCage API
              const coordinates = await getCoordinatesFrom(placeName, stateName)

              if (coordinates) {
                places.push({
                  name: placeName,
                  state: stateName,
                  lat: coordinates.lat,
                  lng: coordinates.lng,
                })
                console.log(`Added place with coordinates: ${placeName}`, coordinates)
              } else {
                // If OpenCage fails, try our fallback database
                const fallbackCoordinates = getFallbackCoordinates(placeName)

                if (fallbackCoordinates) {
                  places.push({
                    name: placeName,
                    state: stateName,
                    ...fallbackCoordinates,
                  })
                  console.log(`Added place with fallback coordinates: ${placeName}`, fallbackCoordinates)
                } else {
                  console.warn(`Could not find coordinates for ${placeName} in ${stateName}`)
                }
              }
            } catch (error) {
              console.error(`Error processing place ${placeName}:`, error)
            }
          }
        } else {
          console.log("No places in parentheses found in line:", line)

          // Try to extract the state name even if there are no parentheses
          const stateMatch = line.match(/^\d+\.\s*([^,]+)/)
          if (stateMatch) {
            const stateName = stateMatch[1].trim()
            console.log(`Found state without parentheses: "${stateName}"`)

            // Try to use the state name as a place
            try {
              const coordinates = await getCoordinatesFrom(stateName, "India")
              if (coordinates) {
                places.push({
                  name: stateName,
                  state: "India",
                  lat: coordinates.lat,
                  lng: coordinates.lng,
                })
                console.log(`Added state as place with coordinates: ${stateName}`, coordinates)
              }
            } catch (error) {
              console.error(`Error processing state as place ${stateName}:`, error)
            }
          }
        }
      }
    }

    console.log(`Total places extracted: ${places.length}`)

    // Only fall back to default places if we couldn't extract ANY places
    if (places.length === 0) {
      console.log("No places found, returning default places for testing")
      return [
        { name: "Manali", state: "Himachal Pradesh", lat: 32.2432, lng: 77.1892 },
        { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
        { name: "Darjeeling", state: "West Bengal", lat: 27.041, lng: 88.2663 },
        { name: "Goa", state: "Goa", lat: 15.2993, lng: 73.9322 },
        { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
      ]
    }

    return places
  } catch (error) {
    console.error("Error extracting places:", error)
    // Return default places in case of error
    return [
      { name: "Manali", state: "Himachal Pradesh", lat: 32.2432, lng: 77.1892 },
      { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
      { name: "Darjeeling", state: "West Bengal", lat: 27.041, lng: 88.2663 },
      { name: "Goa", state: "Goa", lat: 15.2993, lng: 73.9322 },
      { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
    ]
  }
}

// Improved helper function to extract individual place names from various formats
function extractIndividualPlaces(placesText: string): string[] {
  console.log("Extracting individual places from:", placesText)

  // Clean up any redundant text like (India), etc.
  placesText = placesText.replace(/\([^)]*\)/g, "") // remove inner parentheses
  placesText = placesText.replace(/\s*\*\s*/g, ", ") // convert * separators to commas if needed

  // Split by commas, ampersands, or "and" - FIXED THE PATTERN TO PROPERLY HANDLE NAMES LIKE "Nalanda"
  const placesList = placesText
    .split(/\s*(?:,|\s+&|\s+and\s+)\s*/i)
    .map((place) => place.trim())
    .filter(Boolean)

  console.log("Extracted places list:", placesList)
  return placesList
}

// Function to get coordinates from OpenCage API
async function getCoordinatesFrom(placeName: string, stateName: string) {
  try {
    // Check for OpenCage API key
    const apiKey = process.env.OPENCAGE_API_KEY
    if (!apiKey) {
      console.error("OpenCage API key not configured")
      return null
    }

    // Add "India" to improve geocoding accuracy
    const searchQuery = `${placeName}, ${stateName}, India`
    console.log(`Searching OpenCage for: ${searchQuery}`)

    // Use OpenCage API to get coordinates
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(searchQuery)}&key=${apiKey}&limit=1&countrycode=in`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`OpenCage API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data && data.results && data.results.length > 0) {
      const result = data.results[0]
      console.log(`OpenCage found coordinates for ${placeName}: ${result.geometry.lat}, ${result.geometry.lng}`)
      return {
        lat: result.geometry.lat,
        lng: result.geometry.lng,
      }
    }

    console.warn(`OpenCage found no coordinates for ${placeName}`)
    return null
  } catch (error) {
    console.error(`OpenCage error for ${placeName}:`, error)
    return null
  }
}

// Expanded fallback coordinates database with YOUR SPECIFIC PLACES added
function getFallbackCoordinates(placeName: string) {
  const normalizedName = placeName.toLowerCase().trim()

  const coordinatesMap: { [key: string]: { lat: number; lng: number } } = {
    // YOUR SPECIFIC PLACES
    shantiniketan: { lat: 23.6773, lng: 87.6838 },
    raghurajpur: { lat: 20.4162, lng: 85.8266 },
    pipli: { lat: 20.1156, lng: 85.8334 },
    nalanda: { lat: 25.1367, lng: 85.4458 },
    rajgir: { lat: 25.0281, lng: 85.4217 },
    netarhat: { lat: 23.4842, lng: 84.2675 },
    mawlynnong: { lat: 25.2031, lng: 91.9182 },
    shnongpdeng: { lat: 25.1739, lng: 92.0149 },
    
    // Original fallback coordinates
    // Sikkim
    gangtok: { lat: 27.3389, lng: 88.6065 },
    pelling: { lat: 27.3, lng: 88.2333 },
    lachung: { lat: 27.6909, lng: 88.7463 },
    namchi: { lat: 27.1672, lng: 88.3636 },
    ravangla: { lat: 27.3032, lng: 88.3636 },
    yuksom: { lat: 27.3745, lng: 88.2123 },
    yumthang: { lat: 27.8258, lng: 88.698 },
    lachen: { lat: 27.73, lng: 88.56 },
    jheel: { lat: 27.3893, lng: 88.2486 },

    // West Bengal
    darjeeling: { lat: 27.041, lng: 88.2663 },
    kalimpong: { lat: 27.0644, lng: 88.4736 },
    mirik: { lat: 26.8867, lng: 88.1844 },
    siliguri: { lat: 26.7271, lng: 88.3953 },
    kurseong: { lat: 26.8832, lng: 88.2779 },

    // Meghalaya
    shillong: { lat: 25.5788, lng: 91.8933 },
    cherrapunjee: { lat: 25.2799, lng: 91.7263 },
    dawki: { lat: 25.1856, lng: 92.0165 },
    mawsynram: { lat: 25.3069, lng: 91.5831 },
    nongriat: { lat: 25.2484, lng: 91.7124 },

    // Additional places omitted for brevity...
  }

  return coordinatesMap[normalizedName]
}
