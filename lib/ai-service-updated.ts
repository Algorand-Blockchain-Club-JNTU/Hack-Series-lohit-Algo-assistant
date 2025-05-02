import {
  processQueryWithSmartContractEnhancements,
  initializeSmartContractFeatures,
} from "./smart-contract-integration"
import type { AIServiceOptions } from "./types"
import type { AttachedFile } from "@/components/file-attachment"

// Initialize the smart contract features
initializeSmartContractFeatures()

/**
 * Enhanced AI service with smart contract improvements
 * @param query The user query
 * @param options Optional service options
 * @returns Enhanced AI response
 */
export async function enhancedAIService(query: string, options?: AIServiceOptions): Promise<string> {
  // Process the query with smart contract enhancements
  return processQueryWithSmartContractEnhancements(query, options?.walletInfo, options?.files)
}

/**
 * Process a file for AI context
 * @param file The file to process
 * @returns Processed file content
 */
export async function processFileForAI(file: AttachedFile): Promise<string> {
  // Read the file content
  const content = await file.text()

  // Process the content based on file type
  if (file.name.endsWith(".py") || file.name.endsWith(".teal")) {
    // This is likely a smart contract file
    return `Smart Contract File (${file.name}):\n\n${content}`
  }

  // Default processing
  return `File (${file.name}):\n\n${content}`
}
