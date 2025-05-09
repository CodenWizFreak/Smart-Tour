import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    // Validate input
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt parameter" }, { status: 400 })
    }

    // Check for environment variable
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

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
                maxOutputTokens: 2048,
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
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return NextResponse.json({ response: generatedText })
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
