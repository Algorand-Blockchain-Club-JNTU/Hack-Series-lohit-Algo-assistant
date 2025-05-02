import { enhancedSmartContractResponse } from "./ai-service-smart-contract"
import { validateSmartContract } from "./smart-contract-validator"
import { getVotingContractTemplate } from "./voting-contract-template"

/**
 * Initialize the smart contract enhancement features
 */
export function initializeSmartContractFeatures(): void {
  console.log("Smart contract enhancement features initialized")
}

/**
 * Process a user query with enhanced smart contract features
 * @param query The user query
 * @param walletInfo Optional wallet information
 * @param files Optional attached files
 * @returns Enhanced AI response
 */
export async function processQueryWithSmartContractEnhancements(
  query: string,
  walletInfo?: any,
  files?: any[],
): Promise<string> {
  return enhancedSmartContractResponse(query, walletInfo, files)
}

/**
 * Validate a smart contract
 * @param code The smart contract code to validate
 * @returns Validation result
 */
export function validateAlgorandSmartContract(code: string): any {
  return validateSmartContract(code)
}

/**
 * Get the template for a specific type of smart contract
 * @param type The type of smart contract template to get
 * @returns The smart contract template
 */
export function getSmartContractTemplate(type: string): string {
  if (type.toLowerCase() === "voting") {
    return getVotingContractTemplate()
  }

  // Add more template types as needed

  return "Template not found for type: " + type
}
