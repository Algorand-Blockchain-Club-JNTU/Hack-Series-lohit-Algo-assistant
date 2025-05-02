import { type NextRequest, NextResponse } from "next/server"
import { AMCPClient } from "@/lib/amcp-client"

// Initialize AMCP client
const amcpClient = new AMCPClient()

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json()
    const { query, walletInfo, options } = body

    // Ensure we have a query to process
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing or invalid query parameter" }, { status: 400 })
    }

    // Enhance the query with Algorand-specific context
    const enhancedData = await amcpClient.enhanceQuery(query, walletInfo, options)

    // Return the enhanced query and context
    return NextResponse.json(enhancedData)
  } catch (error) {
    console.error("Error in AMCP API:", error)
    return NextResponse.json({ error: "Failed to process AMCP request" }, { status: 500 })
  }
}
