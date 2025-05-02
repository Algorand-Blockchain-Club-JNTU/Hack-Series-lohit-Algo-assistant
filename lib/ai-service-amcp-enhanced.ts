import { type AIServiceOptions, generateResponse, personalizeResponse, enhancePrompt } from "./ai-service"
import type { AMCPClient } from "./amcp-client"
import { type EnhancedAMCPIntegration, createEnhancedAMCPIntegration } from "./enhanced-amcp-integration"
import { validatePyTealCode } from "./pyteal-validator-enhanced"
import { extractCodeFromResponse } from "./code-extractor"

/**
 * Enhanced AI service with improved AMCP integration
 */
export class EnhancedAIService {
  private amcpClient: AMCPClient
  private amcpIntegration: EnhancedAMCPIntegration

  constructor(amcpClient: AMCPClient) {
    this.amcpClient = amcpClient
    this.amcpIntegration = createEnhancedAMCPIntegration(amcpClient)
  }

  /**
   * Generate a response with enhanced AMCP context
   * @param query The user query
   * @param options Additional options for response generation
   * @returns The generated response
   */
  async generateResponse(query: string, options?: AIServiceOptions): Promise<string> {
    try {
      // Get enhanced context
      const enhancedContext = await this.amcpIntegration.getEnhancedContext(query, {
        walletInfo: options?.walletInfo,
        fileContents: options?.fileContents,
        previousMessages: options?.previousMessages,
      })

      // Enhance the prompt with best practices
      const enhancedPrompt = enhancePrompt(query)

      // Generate the response with enhanced context
      const response = await generateResponse(enhancedPrompt, {
        ...options,
        context: enhancedContext,
      })

      // Validate PyTeal code if present
      const validatedResponse = await this.validateResponseCode(response)

      // Personalize the response if wallet info is available
      const personalizedResponse = options?.walletInfo
        ? personalizeResponse(validatedResponse, options.walletInfo)
        : validatedResponse

      return personalizedResponse
    } catch (error) {
      console.error("Error in enhanced AI service:", error)
      return `I encountered an error while generating a response. Please try again or rephrase your question.

Error details: ${error instanceof Error ? error.message : String(error)}`
    }
  }

  /**
   * Validate code in the response
   * @param response The generated response
   * @returns Validated response
   */
  private async validateResponseCode(response: string): Promise<string> {
    // Extract code from the response
    const extractedCode = extractCodeFromResponse(response)

    if (!extractedCode) {
      return response
    }

    // Check if it's PyTeal code
    const isPyTeal =
      extractedCode.includes("import pyteal") ||
      extractedCode.includes("from pyteal") ||
      extractedCode.includes("def approval_program") ||
      extractedCode.includes("def clear_state_program")

    if (isPyTeal) {
      // Validate PyTeal code
      const validationResult = await validatePyTealCode(extractedCode)

      if (!validationResult.valid) {
        // Append validation issues to the response
        return `${response}

---

**Note:** The generated PyTeal code may have some issues:
${validationResult.issues.map((issue) => `- ${issue}`).join("\n")}

Please review and adjust the code as needed.`
      }
    }

    return response
  }
}

/**
 * Create an enhanced AI service instance
 * @param amcpClient The AMCP client instance
 * @returns An enhanced AI service instance
 */
export function createEnhancedAIService(amcpClient: AMCPClient): EnhancedAIService {
  return new EnhancedAIService(amcpClient)
}
