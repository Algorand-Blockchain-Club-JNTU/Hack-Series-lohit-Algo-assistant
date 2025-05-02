import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { validateAndCorrectResponse } from "@/lib/response-validator"
import { getSmartContractBestPractices } from "@/lib/algorand-knowledge-base"
import { AMCPContextType } from "@/lib/amcp-client"

// Initialize Google Generative AI
const apiKey = process.env.GOOGLE_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Update the POST function to use AMCP contexts
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json()
    const { query, walletInfo, amcpContexts } = body

    // Ensure we have a query to process
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing or invalid query parameter" }, { status: 400 })
    }

    if (!genAI) {
      return NextResponse.json({ error: "Google Generative AI not initialized" }, { status: 500 })
    }

    // Try with gemini-1.5-pro-latest first
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      })

      // Create a prompt that ensures Algorand-specific responses
      // Include AMCP context information if available
      let contextInfo = ""
      if (amcpContexts && amcpContexts.length > 0) {
        contextInfo = "\nALGORAND CONTEXT INFORMATION:\n"

        // Process each context type with specific formatting
        amcpContexts.forEach((context: any) => {
          contextInfo += `- ${context.type.toUpperCase()}: `

          switch (context.type) {
            case AMCPContextType.BLOCKCHAIN_STATE:
              contextInfo += `Current round: ${context.data.currentRound}, Last block: ${new Date(
                context.data.lastBlock,
              ).toISOString()}\n`
              break

            case AMCPContextType.ACCOUNT_INFO:
              contextInfo += `Address: ${context.data.address}, Balance: ${
                context.data.balance / 1000000
              } ALGO, Network: ${context.data.network}\n`
              break

            case AMCPContextType.SMART_CONTRACT:
              contextInfo += `Latest TEAL version: ${context.data.latestTEALVersion}, Recommended PyTeal: ${context.data.recommendedPyTealVersion}\n`

              // Add best practices if available
              if (context.data.bestPractices && context.data.bestPractices.length > 0) {
                contextInfo += "  Best Practices:\n"
                context.data.bestPractices.slice(0, 3).forEach((practice: string) => {
                  contextInfo += `    - ${practice}\n`
                })
              }

              // Add state management info if available
              if (context.data.stateManagement) {
                contextInfo += "  State Management:\n"
                contextInfo += `    - Global: ${context.data.stateManagement.global.maxSize}\n`
                contextInfo += `    - Local: ${context.data.stateManagement.local.maxSize}\n`
              }
              break

            case AMCPContextType.SMART_CONTRACT_TEMPLATE:
              contextInfo += `Template: ${context.data.templateName || "Unknown"}, ${
                context.data.description || "No description available"
              }\n`
              if (context.data.keyFeatures && context.data.keyFeatures.length > 0) {
                contextInfo += "  Key Features:\n"
                context.data.keyFeatures.slice(0, 3).forEach((feature: string) => {
                  contextInfo += `    - ${feature}\n`
                })
              }
              break

            case AMCPContextType.ASA_INFO:
              contextInfo += `Latest standards: ${context.data.latestStandards.join(", ")}\n`
              if (context.data.bestPractices && context.data.bestPractices.length > 0) {
                contextInfo += "  Best Practices:\n"
                context.data.bestPractices.slice(0, 2).forEach((practice: string) => {
                  contextInfo += `    - ${practice}\n`
                })
              }
              break

            case AMCPContextType.DEVELOPER_DOCS:
              contextInfo += `Available SDKs: ${context.data.sdks
                .map((sdk: any) => `${sdk.name} v${sdk.version}`)
                .join(", ")}\n`
              if (context.data.tools && context.data.tools.length > 0) {
                contextInfo += "  Tools:\n"
                context.data.tools.slice(0, 3).forEach((tool: any) => {
                  contextInfo += `    - ${tool.name}: ${tool.description}\n`
                })
              }
              break

            default:
              contextInfo += `${JSON.stringify(context.data).substring(0, 100)}...\n`
          }
        })
      }

      // Get best practices for smart contract development
      const bestPractices = getSmartContractBestPractices().slice(0, 5).join("\n- ")

      const prompt = `
You are AlgoAssist, an expert AI assistant specializing in Algorand blockchain development, with a focus on smart contract development and decentralized applications (dApps).

CRITICAL INSTRUCTIONS:
- Only provide PyTeal or TEAL code when the user explicitly asks for a smart contract or code example
- Do not generate smart contract code for general questions about Algorand concepts
- When asked to create smart contracts, ONLY provide PyTeal or TEAL code
- For dApps, provide code that uses Algorand SDKs (JavaScript, Python, Go, etc.)
- Use code blocks with appropriate language tags (e.g. \`\`\`python, \`\`\`teal)
- Explain Algorand-specific concepts thoroughly
- If you don't know something, say so rather than making up information
- Format your responses using markdown

RESPONSE GUIDELINES:
- For general questions about Algorand concepts, provide clear explanations without code unless specifically requested
- Only generate smart contract code when the user explicitly asks for it
- When generating code, follow these guidelines:
  - Use PyTeal for high-level contract development
  - Use TEAL for low-level or optimized contracts
  - Reference Algorand's stateful smart contract model
  - Explain global and local state usage
  - Include proper approval and clear programs
  - Follow Algorand best practices for security and efficiency
  - Always prioritize security and best practices in your code
  - Include comments that explain the logic and purpose of key code sections
  - Provide explanations of gas optimization techniques used
  - Consider edge cases and potential vulnerabilities
  - For dApp designs, explain architecture choices and integration points
  - Include testing strategies for any code that you generate

SMART CONTRACT BEST PRACTICES:
- ${bestPractices}

${contextInfo}
${
  walletInfo?.connected
    ? `
USER WALLET INFORMATION:
- Address: ${walletInfo.address}
- ALGO Balance: ${walletInfo.algo_balance / 1000000} ALGO
- Connected: ${walletInfo.connected}
`
    : ""
}

USER QUESTION: ${query}
`

      // Log the prompt for debugging
      console.log("Sending prompt to AI:", prompt)

      const result = await model.generateContent(prompt)
      const response = result.response.text()

      // Validate and correct the response if needed
      const {
        response: validatedResponse,
        wasModified,
        validationDetails,
      } = await validateAndCorrectResponse(query, response)

      if (wasModified) {
        console.log("Response was modified:", validationDetails)
      }

      return NextResponse.json({ response: validatedResponse })
    } catch (proError) {
      console.warn("Error with primary model, trying fallback model:", proError)

      // Try with gemini-1.0-pro as fallback (older stable version)
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.0-pro",
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
          },
        })

        // Get best practices for smart contract development
        const bestPractices = getSmartContractBestPractices().slice(0, 5).join("\n- ")

        // Create a prompt that ensures Algorand-specific responses (same as above)
        const prompt = `
You are AlgoAssist, an expert AI assistant specializing in Algorand blockchain development, with a focus on smart contract development and decentralized applications (dApps).

CRITICAL INSTRUCTIONS:
- Only provide PyTeal or TEAL code when the user explicitly asks for a smart contract or code example
- Do not generate smart contract code for general questions about Algorand concepts
- When asked to create smart contracts, ONLY provide PyTeal or TEAL code
- For dApps, provide code that uses Algorand SDKs (JavaScript, Python, Go, etc.)
- Use code blocks with appropriate language tags (e.g. \`\`\`python, \`\`\`teal)
- Explain Algorand-specific concepts thoroughly
- If you don't know something, say so rather than making up information
- Format your responses using markdown

RESPONSE GUIDELINES:
- For general questions about Algorand concepts, provide clear explanations without code unless specifically requested
- Only generate smart contract code when the user explicitly asks for it
- When generating code, follow these guidelines:
  - Use PyTeal for high-level contract development
  - Use TEAL for low-level or optimized contracts
  - Reference Algorand's stateful smart contract model
  - Explain global and local state usage
  - Include proper approval and clear programs
  - Follow Algorand best practices for security and efficiency
  - Always prioritize security and best practices in your code
  - Include comments that explain the logic and purpose of key code sections
  - Provide explanations of gas optimization techniques used
  - Consider edge cases and potential vulnerabilities
  - For dApp designs, explain architecture choices and integration points
  - Include testing strategies for any code that you generate

SMART CONTRACT BEST PRACTICES:
- ${bestPractices}

${
  walletInfo?.connected
    ? `
USER WALLET INFORMATION:
- Address: ${walletInfo.address}
- ALGO Balance: ${walletInfo.algo_balance / 1000000} ALGO
- Connected: ${walletInfo.connected}
`
    : ""
}

USER QUESTION: ${query}
`

        const result = await model.generateContent(prompt)
        const response = result.response.text()

        // Validate and correct the response if needed
        const {
          response: validatedResponse,
          wasModified,
          validationDetails,
        } = await validateAndCorrectResponse(query, response)

        if (wasModified) {
          console.log("Response was modified:", validationDetails)
        }

        return NextResponse.json({ response: validatedResponse })
      } catch (fallbackError) {
        // If both models fail, try a simpler text-only model as a last resort
        try {
          const model = genAI.getGenerativeModel({ model: "models/text-bison-001" })
          const result = await model.generateContent(
            `Provide a brief answer about Algorand blockchain related to: ${query}`,
          )
          const response = result.response.text()
          return NextResponse.json({
            response: `*Note: Using simplified model due to technical issues*\n\n${response}`,
          })
        } catch (lastResortError) {
          console.error("All models failed:", lastResortError)
          throw new Error("Failed to generate content with any available model")
        }
      }
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
