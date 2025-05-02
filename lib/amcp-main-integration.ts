import { AMCPClient } from "./amcp-client"
import { type EnhancedAIService, createEnhancedAIService } from "./ai-service-amcp-enhanced"

/**
 * Main integration module for AMCP
 */
export class AMCPMainIntegration {
  private amcpClient: AMCPClient
  private aiService: EnhancedAIService

  constructor() {
    // Create AMCP client
    this.amcpClient = new AMCPClient()

    // Create enhanced AI service
    this.aiService = createEnhancedAIService(this.amcpClient)
  }

  /**
   * Get the AMCP client
   * @returns The AMCP client
   */
  getAMCPClient(): AMCPClient {
    return this.amcpClient
  }

  /**
   * Get the enhanced AI service
   * @returns The enhanced AI service
   */
  getAIService(): EnhancedAIService {
    return this.aiService
  }

  /**
   * Initialize the AMCP integration
   * This can be used to preload templates or perform other initialization tasks
   */
  async initialize(): Promise<void> {
    try {
      // Preload common templates
      await this.amcpClient.preloadCommonTemplates()
      console.log("AMCP integration initialized successfully")
    } catch (error) {
      console.error("Error initializing AMCP integration:", error)
    }
  }
}

// Singleton instance
let amcpMainIntegration: AMCPMainIntegration | null = null

/**
 * Get the AMCP main integration instance
 * @returns The AMCP main integration instance
 */
export function getAMCPMainIntegration(): AMCPMainIntegration {
  if (!amcpMainIntegration) {
    amcpMainIntegration = new AMCPMainIntegration()
  }
  return amcpMainIntegration
}
