import { fetchWebSearchResponse, simulateAIResponse } from "./ai-service"
import { processSmartContractResponse } from "./smart-contract-processor"
import type { AIServiceOptions } from "./types"
import type { AttachedFile } from "@/components/file-attachment"

/**
 * Enhanced AI service with improved smart contract generation
 * @param query The user query
 * @param walletInfo Optional wallet information
 * @param files Optional attached files
 * @returns Enhanced AI response
 */
export async function enhancedSmartContractResponse(
  query: string,
  walletInfo?: AIServiceOptions["walletInfo"],
  files?: AttachedFile[],
): Promise<string> {
  // Check if this is a smart contract query
  const isSmartContractQuery = isSmartContractRequest(query)

  if (isSmartContractQuery) {
    // Enhance the query with specific instructions for smart contracts
    const enhancedQuery = enhanceSmartContractQuery(query)

    // Get response using the enhanced query
    let response
    try {
      response = await fetchWebSearchResponse(enhancedQuery, walletInfo, files)
    } catch (error) {
      console.error("Error with web search, falling back to client-side AI:", error)
      response = await simulateAIResponse(enhancedQuery, files)
    }

    // Process and enhance the smart contract response
    return processSmartContractResponse(query, response)
  }

  // For non-smart contract queries, use the standard response flow
  try {
    return await fetchWebSearchResponse(query, walletInfo, files)
  } catch (error) {
    console.error("Error with web search, falling back to client-side AI:", error)
    return await simulateAIResponse(query, files)
  }
}

/**
 * Check if a query is requesting a smart contract
 * @param query The query to check
 * @returns True if the query is requesting a smart contract
 */
function isSmartContractRequest(query: string): boolean {
  const lowerQuery = query.toLowerCase()

  return (
    lowerQuery.includes("smart contract") ||
    lowerQuery.includes("pyteal") ||
    lowerQuery.includes("teal") ||
    (lowerQuery.includes("contract") &&
      (lowerQuery.includes("algorand") ||
        lowerQuery.includes("voting") ||
        lowerQuery.includes("token") ||
        lowerQuery.includes("nft")))
  )
}

/**
 * Enhance a smart contract query with specific instructions
 * @param query The original query
 * @returns Enhanced query with smart contract instructions
 */
function enhanceSmartContractQuery(query: string): string {
  const lowerQuery = query.toLowerCase()

  // Base enhancement
  let enhancedQuery = query + "\n\nPlease ensure the smart contract follows these guidelines:\n"
  enhancedQuery += "1. Use proper type conversions (Btoi for application arguments, Itob for integer keys)\n"
  enhancedQuery += "2. Include proper error handling and input validation\n"
  enhancedQuery += "3. Use consistent state key management\n"
  enhancedQuery += "4. Handle OptIn transactions correctly if using local state\n"
  enhancedQuery += "5. Check if accounts have opted in before accessing local state\n"

  // Add specific instructions for voting contracts
  if (
    lowerQuery.includes("voting") ||
    lowerQuery.includes("vote") ||
    lowerQuery.includes("ballot") ||
    lowerQuery.includes("election")
  ) {
    enhancedQuery += "\nFor a voting contract specifically:\n"
    enhancedQuery += "1. Store the number of candidates in global state\n"
    enhancedQuery += "2. Use a consistent key scheme for candidate vote counts\n"
    enhancedQuery += "3. Track whether users have voted using local state\n"
    enhancedQuery += "4. Prevent double voting\n"
    enhancedQuery += "5. Include proper deployment and interaction examples\n"
  }

  return enhancedQuery
}
