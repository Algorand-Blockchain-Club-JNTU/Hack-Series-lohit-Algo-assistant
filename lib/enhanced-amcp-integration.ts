import type { AMCPClient } from "./amcp-client"
import type { AIServiceOptions } from "./ai-service"

/**
 * Enhanced AMCP integration to improve context handling for Algorand smart contracts
 */
export class EnhancedAMCPIntegration {
  private amcpClient: AMCPClient

  constructor(amcpClient: AMCPClient) {
    this.amcpClient = amcpClient
  }

  /**
   * Get enhanced context for a user query
   * @param query The user query
   * @param options Additional options for context retrieval
   * @returns Enhanced context for the AI service
   */
  async getEnhancedContext(
    query: string,
    options?: {
      walletInfo?: AIServiceOptions["walletInfo"]
      fileContents?: string[]
      previousMessages?: { role: string; content: string }[]
    },
  ): Promise<string> {
    // Base context from AMCP
    const baseContext = await this.amcpClient.getContext(query)

    // Determine if this is a smart contract related query
    const isSmartContractQuery = this.isSmartContractRelated(query)

    // Get smart contract specific context if needed
    let smartContractContext = ""
    if (isSmartContractQuery) {
      smartContractContext = await this.getSmartContractContext(query, options?.fileContents)
    }

    // Get wallet context if available
    let walletContext = ""
    if (options?.walletInfo?.connected) {
      walletContext = this.getWalletContext(options.walletInfo)
    }

    // Get conversation context if available
    let conversationContext = ""
    if (options?.previousMessages && options.previousMessages.length > 0) {
      conversationContext = this.getConversationContext(options.previousMessages)
    }

    // Combine all contexts with appropriate weighting
    return this.combineContexts({
      baseContext,
      smartContractContext,
      walletContext,
      conversationContext,
    })
  }

  /**
   * Determine if a query is related to smart contracts
   * @param query The user query
   * @returns True if the query is related to smart contracts
   */
  private isSmartContractRelated(query: string): boolean {
    const lowerQuery = query.toLowerCase()
    const smartContractKeywords = [
      "smart contract",
      "pyteal",
      "teal",
      "application",
      "stateful",
      "stateless",
      "approval",
      "clear state",
      "transaction",
      "atomic",
      "asset",
      "asa",
      "algorand standard asset",
      "nft",
      "token",
      "voting",
      "auction",
      "escrow",
    ]

    return smartContractKeywords.some((keyword) => lowerQuery.includes(keyword))
  }

  /**
   * Get smart contract specific context
   * @param query The user query
   * @param fileContents Optional file contents for additional context
   * @returns Smart contract specific context
   */
  private async getSmartContractContext(query: string, fileContents?: string[]): Promise<string> {
    // Try to determine the type of smart contract from the query
    const contractType = this.determineContractType(query)

    // Get template context based on contract type
    const templateContext = await this.amcpClient.getSmartContractTemplate(contractType)

    // Extract code from file contents if available
    let codeContext = ""
    if (fileContents && fileContents.length > 0) {
      codeContext = this.extractCodeFromFiles(fileContents)
    }

    return `
SMART CONTRACT CONTEXT:
Contract Type: ${contractType}

${templateContext}

${codeContext ? `USER CODE:\n${codeContext}` : ""}
`
  }

  /**
   * Determine the type of smart contract from a query
   * @param query The user query
   * @returns The determined contract type
   */
  private determineContractType(query: string): string {
    const lowerQuery = query.toLowerCase()

    // Map of keywords to contract types
    const contractTypeMap: Record<string, string> = {
      voting: "voting",
      vote: "voting",
      election: "voting",
      poll: "voting",
      auction: "auction",
      bid: "auction",
      escrow: "escrow",
      token: "token",
      asa: "token",
      asset: "token",
      nft: "nft",
      collectible: "nft",
      dao: "dao",
      governance: "dao",
    }

    // Check for contract type keywords
    for (const [keyword, type] of Object.entries(contractTypeMap)) {
      if (lowerQuery.includes(keyword)) {
        return type
      }
    }

    // Default to generic if no specific type is found
    return "generic"
  }

  /**
   * Extract code from file contents
   * @param fileContents Array of file contents
   * @returns Extracted code as a string
   */
  private extractCodeFromFiles(fileContents: string[]): string {
    // Join all file contents with separators
    return fileContents
      .map((content, index) => {
        // Try to determine if this is Python/PyTeal code
        const isPython =
          content.includes("import pyteal") ||
          content.includes("from pyteal") ||
          content.includes("def approval_program") ||
          content.includes("def clear_state_program")

        // Try to determine if this is TEAL code
        const isTeal =
          content.includes("#pragma version") ||
          content.includes("txn ApplicationID") ||
          content.includes("global") ||
          content.includes("gtxn")

        let fileType = "unknown"
        if (isPython) fileType = "python/pyteal"
        else if (isTeal) fileType = "teal"

        return `--- FILE ${index + 1} (${fileType}) ---\n${content}\n`
      })
      .join("\n\n")
  }

  /**
   * Get wallet context from wallet info
   * @param walletInfo Wallet information
   * @returns Wallet context as a string
   */
  private getWalletContext(walletInfo: AIServiceOptions["walletInfo"]): string {
    if (!walletInfo?.connected) return ""

    return `
WALLET CONTEXT:
Address: ${walletInfo.address}
Network: ${walletInfo.network || "Algorand"}
Balance: ${(walletInfo.algo_balance ? walletInfo.algo_balance / 1000000 : 0).toFixed(2)} ALGO
${
  walletInfo.assets && walletInfo.assets.length > 0
    ? `Assets: ${walletInfo.assets.map((asset) => `${asset.amount} of ${asset.name || asset["asset-id"]}`).join(", ")}`
    : "Assets: None"
}
`
  }

  /**
   * Get conversation context from previous messages
   * @param messages Previous messages
   * @returns Conversation context as a string
   */
  private getConversationContext(messages: { role: string; content: string }[]): string {
    // Only use the last few messages for context
    const recentMessages = messages.slice(-5)

    return `
CONVERSATION CONTEXT:
${recentMessages.map((msg) => `${msg.role.toUpperCase()}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? "..." : ""}`).join("\n")}
`
  }

  /**
   * Combine different contexts with appropriate weighting
   * @param contexts Object containing different context types
   * @returns Combined context as a string
   */
  private combineContexts(contexts: {
    baseContext: string
    smartContractContext: string
    walletContext: string
    conversationContext: string
  }): string {
    return `
${contexts.baseContext}

${contexts.smartContractContext}

${contexts.walletContext}

${contexts.conversationContext}

INSTRUCTIONS:
1. Prioritize smart contract correctness and security
2. Follow Algorand best practices
3. Ensure proper state management in stateful contracts
4. Use appropriate ABI annotations for method-based contracts
5. Validate all inputs and handle edge cases
6. Provide clear explanations of the code
7. Include testing strategies when appropriate
`
  }
}

/**
 * Create an enhanced AMCP integration instance
 * @param amcpClient The AMCP client instance
 * @returns An enhanced AMCP integration instance
 */
export function createEnhancedAMCPIntegration(amcpClient: AMCPClient): EnhancedAMCPIntegration {
  return new EnhancedAMCPIntegration(amcpClient)
}
