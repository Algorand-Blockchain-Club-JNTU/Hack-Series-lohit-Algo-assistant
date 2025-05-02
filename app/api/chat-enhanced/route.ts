import { type NextRequest, NextResponse } from "next/server"
import { getAMCPMainIntegration } from "@/lib/amcp-main-integration"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { query, walletInfo, fileContents, previousMessages } = await req.json()

    // Get the AMCP main integration
    const amcpIntegration = getAMCPMainIntegration()

    // Initialize if not already initialized
    await amcpIntegration.initialize()

    // Get the enhanced AI service
    const aiService = amcpIntegration.getAIService()

    // Generate response
    const response = await aiService.generateResponse(query, {
      walletInfo,
      fileContents,
      previousMessages,
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to generate response", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
