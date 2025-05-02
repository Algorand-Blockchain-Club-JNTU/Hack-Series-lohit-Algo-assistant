import { amcpClient, AMCPContextType } from "./amcp-client"
import type { AIServiceOptions } from "./types"

/**
 * Initializes the AMCP integration
 */
export function initializeAMCPIntegration() {
  console.log("AMCP Integration initialized")
  return true
}

/**
 * Enhances a query with Algorand-specific context
 * @param query The user's query
 * @param walletInfo Optional wallet information
 * @param options Additional options for context retrieval
 * @returns Enhanced query with relevant Algorand context
 */
export async function enhanceQueryWithAMCP(
  query: string,
  walletInfo?: AIServiceOptions["walletInfo"],
  options?: any
) {
  try {
    // Determine query type and set appropriate context priorities
    const lowerQuery = query.toLowerCase()
    
    const amcpOptions: any = {
      maxContexts: 5,
      priorityTypes: [],
    }
    
    // Smart contract related query
    if (
      lowerQuery.includes("smart contract") ||
      lowerQuery.includes("pyteal") ||
      lowerQuery.includes("teal") ||
      lowerQuery.includes("application") ||
      lowerQuery.includes("stateful") ||
      lowerQuery.includes("stateless")
    ) {
      amcpOptions.priorityTypes = [
        AMCPContextType.SMART_CONTRACT_TEMPLATE,
        AMCPContextType.SMART_CONTRACT,
        AMCPContextType.DEVELOPER_DOCS,
      ]
      
      // Check for specific contract types
      if (
        lowerQuery.includes("voting") || 
        lowerQuery.includes("vote") || 
        lowerQuery.includes("ballot") || 
        lowerQuery.includes("election")
      ) {
        // Add voting-specific template context
        const templateContext = await amcpClient.getRelevantTemplate("voting")
        if (templateContext) {
          console.log("Found relevant voting template")
        }
      }
    } 
    // ASA related query
    else if (
      lowerQuery.includes("asa") ||
      lowerQuery.includes("asset") ||
      lowerQuery.includes("token") ||
      lowerQuery.includes("nft")
    ) {
      amcpOptions.priorityTypes = [
        AMCPContextType.ASA_INFO,
        AMCPContextType.DEVELOPER_DOCS,
      ]
    }
    // Wallet relate
\
I did not output the full code. I will fix this.
