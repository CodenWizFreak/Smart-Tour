import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Path to your PDF in the public directory
    // Note: When accessing files in public directory, don't include "public" in the path
    // Assuming your PDF is at public/resume.pdf
    const filePath = path.join(process.cwd(), "public", "Smart-Tour.pdf")
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "PDF file not found" }, { status: 404 })
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath)
    
    // Create a response with the file content and appropriate headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=smarttourdoc.pdf",
      },
    })
    
    return response
  } catch (error) {
    console.error("Error serving PDF:", error)
    return NextResponse.json({ error: "Failed to serve PDF" }, { status: 500 })
  }
}
