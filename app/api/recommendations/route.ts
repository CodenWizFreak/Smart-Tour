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
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

// Improve the extractPlacesFromResponse function to better handle the response
// Replace the extractPlacesFromResponse function with:

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
        const parenthesesMatch = line.match(/$$([^)]+)$$/)

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
              // Try to get coordinates from  API
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
                // If  fails, try our fallback database
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

    // If no places were found, return default places for testing
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

// Helper function to extract individual place names from various formats
function extractIndividualPlaces(placesText: string): string[] {
  console.log("Extracting individual places from:", placesText)

  // Clean up any redundant text like (India), etc.
  placesText = placesText.replace(/$$[^)]*$$/g, "") // remove inner parentheses
  placesText = placesText.replace(/\s*\*\s*/g, ", ") // convert * separators to commas if needed

  // Now split by commas, ampersands, or "and"
  const placesList = placesText
    .split(/\s*(?:,|&|and)\s*/i)
    .map((place) => place.trim())
    .filter(Boolean)

  console.log("Extracted places list:", placesList)
  return placesList
}

// Function to get coordinates from  API
async function getCoordinatesFrom(placeName: string, stateName: string) {
  try {
    // Check for  API key
    const apiKey = process.env._API_KEY
    if (!apiKey) {
      console.error(" API key not configured")
      return null
    }

    // Add "India" to improve geocoding accuracy
    const searchQuery = `${placeName}, ${stateName}, India`
    console.log(`Searching  for: ${searchQuery}`)

    // Use  API to get coordinates
    const response = await fetch(
      `https://api.data.com/geocode/v1/json?q=${encodeURIComponent(searchQuery)}&key=${apiKey}&limit=1&countrycode=in`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(` API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data && data.results && data.results.length > 0) {
      const result = data.results[0]
      console.log(` found coordinates for ${placeName}: ${result.geometry.lat}, ${result.geometry.lng}`)
      return {
        lat: result.geometry.lat,
        lng: result.geometry.lng,
      }
    }

    console.warn(` found no coordinates for ${placeName}`)
    return null
  } catch (error) {
    console.error(` error for ${placeName}:`, error)
    return null
  }
}

// Expanded fallback coordinates database
function getFallbackCoordinates(placeName: string) {
  const normalizedName = placeName.toLowerCase().trim()

  const coordinatesMap = {
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
    mawlynnong: { lat: 25.2031, lng: 91.9182 },
    dawki: { lat: 25.1856, lng: 92.0165 },
    mawsynram: { lat: 25.3069, lng: 91.5831 },
    nongriat: { lat: 25.2484, lng: 91.7124 },

    // Uttarakhand
    nainital: { lat: 29.3919, lng: 79.4542 },
    mussoorie: { lat: 30.4598, lng: 78.0644 },
    rishikesh: { lat: 30.0869, lng: 78.2676 },
    haridwar: { lat: 29.9457, lng: 78.1642 },
    dehradun: { lat: 30.3165, lng: 78.0322 },
    auli: { lat: 30.5303, lng: 79.5677 },
    "jim corbett": { lat: 29.53, lng: 78.7747 },
    badrinath: { lat: 30.7433, lng: 79.4938 },
    kedarnath: { lat: 30.7346, lng: 79.0669 },

    // Himachal Pradesh
    dalhousie: { lat: 32.5387, lng: 75.9701 },
    khajjiar: { lat: 32.5453, lng: 76.0638 },
    manali: { lat: 32.2432, lng: 77.1892 },
    shimla: { lat: 31.1048, lng: 77.1734 },
    kullu: { lat: 31.9592, lng: 77.1089 },
    dharamshala: { lat: 32.219, lng: 76.3234 },
    mcleodganj: { lat: 32.2427, lng: 76.3233 },
    kasol: { lat: 32.01, lng: 77.3152 },
    spiti: { lat: 32.2464, lng: 78.0349 },
    kufri: { lat: 31.0978, lng: 77.2696 },
    chail: { lat: 30.9677, lng: 77.1907 },

    // Odisha
    puri: { lat: 19.8133, lng: 85.8314 },
    konark: { lat: 19.8876, lng: 86.0945 },
    gopalpur: { lat: 19.2583, lng: 84.907 },
    chandipur: { lat: 21.4669, lng: 87.0193 },
    bhubaneswar: { lat: 20.2961, lng: 85.8245 },
    "chilika lake": { lat: 19.7158, lng: 85.3311 },

    // West Bengal
    digha: { lat: 21.6238, lng: 87.5059 },
    mandarmani: { lat: 21.6735, lng: 87.6729 },
    tajpur: { lat: 21.6077, lng: 87.5677 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    sundarbans: { lat: 21.9497, lng: 88.8107 },
    santiniketan: { lat: 23.6773, lng: 87.6838 },

    // Andhra Pradesh
    visakhapatnam: { lat: 17.6868, lng: 83.2185 },
    vizag: { lat: 17.6868, lng: 83.2185 },
    araku: { lat: 18.3273, lng: 82.8695 },
    "araku valley": { lat: 18.3273, lng: 82.8695 },
    tirupati: { lat: 13.6288, lng: 79.4192 },
    vijayawada: { lat: 16.5062, lng: 80.648 },

    // Tamil Nadu
    mahabalipuram: { lat: 12.6269, lng: 80.1928 },
    pondicherry: { lat: 11.9416, lng: 79.8083 },
    ooty: { lat: 11.4102, lng: 76.695 },
    kodaikanal: { lat: 10.2381, lng: 77.4892 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    madurai: { lat: 9.9252, lng: 78.1198 },
    rameshwaram: { lat: 9.2876, lng: 79.3129 },
    kanyakumari: { lat: 8.0883, lng: 77.5385 },

    // Kerala
    kovalam: { lat: 8.3988, lng: 76.9781 },
    alleppey: { lat: 9.4981, lng: 76.3388 },
    alappuzha: { lat: 9.4981, lng: 76.3388 },
    munnar: { lat: 10.0889, lng: 77.0595 },
    wayanad: { lat: 11.6854, lng: 76.132 },
    kochi: { lat: 9.9312, lng: 76.2673 },
    thekkady: { lat: 9.5835, lng: 77.183 },
    varkala: { lat: 8.7378, lng: 76.7163 },
    kumarakom: { lat: 9.6144, lng: 76.4254 },

    // Goa
    goa: { lat: 15.2993, lng: 73.9322 },
    panjim: { lat: 15.4909, lng: 73.8278 },
    calangute: { lat: 15.544, lng: 73.7527 },
    baga: { lat: 15.5553, lng: 73.754 },
    anjuna: { lat: 15.5746, lng: 73.7419 },
    palolem: { lat: 15.01, lng: 74.0232 },

    // Rajasthan
    jaipur: { lat: 26.9124, lng: 75.7873 },
    udaipur: { lat: 24.5854, lng: 73.7125 },
    jodhpur: { lat: 26.2389, lng: 73.0243 },
    jaisalmer: { lat: 26.9157, lng: 70.9083 },
    pushkar: { lat: 26.4872, lng: 74.5542 },
    "mount abu": { lat: 24.5926, lng: 72.7156 },
    bikaner: { lat: 28.0229, lng: 73.3119 },

    // Gujarat
    ahmedabad: { lat: 23.0225, lng: 72.5714 },
    kutch: { lat: 23.7337, lng: 69.8597 },
    dwarka: { lat: 22.2442, lng: 68.9685 },
    somnath: { lat: 20.888, lng: 70.401 },
    gir: { lat: 21.139, lng: 70.8236 },
    "rann of kutch": { lat: 23.8348, lng: 69.5371 },

    // Major cities
    mumbai: { lat: 19.076, lng: 72.8777 },
    delhi: { lat: 28.6139, lng: 77.209 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
    bengaluru: { lat: 12.9716, lng: 77.5946 },
    hyderabad: { lat: 17.385, lng: 78.4867 },
    agra: { lat: 27.1767, lng: 78.0081 },
    varanasi: { lat: 25.3176, lng: 82.9739 },
    amritsar: { lat: 31.634, lng: 74.8723 },
    lucknow: { lat: 26.8467, lng: 80.9462 },
    srinagar: { lat: 34.0837, lng: 74.7973 },
    leh: { lat: 34.1526, lng: 77.5771 },
    ladakh: { lat: 34.1526, lng: 77.5771 },
  }

  return coordinatesMap[normalizedName]
}
