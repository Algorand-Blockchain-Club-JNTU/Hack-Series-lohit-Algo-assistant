/**
 * Specialized prompt engineering for PyTeal code generation
 */

/**
 * Generate an optimized prompt for PyTeal code generation
 * @param query The user's original query
 * @returns Enhanced prompt for better PyTeal code generation
 */
export function generatePyTealPrompt(query: string): string {
  // Extract the core request
  const coreRequest = extractCoreRequest(query)

  // Determine the contract type
  const contractType = determineContractType(query)

  // Build the enhanced prompt
  const enhancedPrompt = `Generate a secure, well-commented PyTeal smart contract for Algorand that ${coreRequest}.

CONTRACT TYPE: ${contractType}

Please follow these specific requirements:
1. Use PyTeal version 0.22.0 or later syntax
2. Include both approval_program() and clear_state_program() functions
3. Use proper state management with Bytes() for keys
4. Include comprehensive input validation and error handling
5. Follow Algorand security best practices
6. Add detailed comments explaining the logic
7. Include proper initialization in on_creation
8. Handle all relevant transaction types
9. Implement proper authorization checks
10. Use descriptive variable names

The code should be production-ready and follow these structural guidelines:
- Start with imports and any necessary type definitions
- Define global and local state variables as constants
- Implement helper subroutines for reusable logic
- Structure the main program with clear conditional logic
- Include compilation code at the end

Original query: ${query}`

  return enhancedPrompt
}

/**
 * Extract the core request from a query
 * @param query The user's query
 * @returns The core request
 */
function extractCoreRequest(query: string): string {
  // Remove common prefixes
  let cleaned = query.replace(/^(please|can you|i need|create|write|implement|develop|build|make|generate)/i, "").trim()

  // Remove "a smart contract for" or similar phrases
  cleaned = cleaned
    .replace(/(a|an)?\s*(smart contract|contract|pyteal code|program|application|dapp)\s*(for|that|which|to)?/i, "")
    .trim()

  // If the result is too short, return the original query
  if (cleaned.length < 10) {
    return query
  }

  return cleaned
}

/**
 * Determine the contract type from a query
 * @param query The user's query
 * @returns The determined contract type
 */
function determineContractType(query: string): string {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("voting") || lowerQuery.includes("ballot") || lowerQuery.includes("election")) {
    return "Voting Contract"
  }

  if (lowerQuery.includes("token") || lowerQuery.includes("sale") || lowerQuery.includes("ico")) {
    return "Token Sale Contract"
  }

  if (lowerQuery.includes("nft") || lowerQuery.includes("marketplace") || lowerQuery.includes("auction")) {
    return "NFT Marketplace Contract"
  }

  if (lowerQuery.includes("escrow") || lowerQuery.includes("multisig")) {
    return "Escrow Contract"
  }

  if (lowerQuery.includes("dao") || lowerQuery.includes("governance")) {
    return "DAO Governance Contract"
  }

  if (lowerQuery.includes("staking") || lowerQuery.includes("reward")) {
    return "Staking Rewards Contract"
  }

  if (lowerQuery.includes("oracle") || lowerQuery.includes("data feed")) {
    return "Oracle Contract"
  }

  // Default
  return "Generic Smart Contract"
}

/**
 * Generate system instructions for PyTeal code generation
 * @returns System instructions for the AI model
 */
export function getPyTealSystemInstructions(): string {
  return `You are an expert Algorand smart contract developer specializing in PyTeal. 
  
When writing PyTeal code:

1. ALWAYS use Bytes() for global and local state keys
2. ALWAYS initialize global state in on_creation
3. ALWAYS include proper approval and clear state programs
4. ALWAYS validate all inputs and transaction parameters
5. ALWAYS use descriptive variable names
6. ALWAYS include comments explaining the logic
7. ALWAYS handle edge cases and potential errors
8. NEVER use variables directly as state keys
9. NEVER forget to check authorization for sensitive operations
10. NEVER leave state uninitialized

For voting contracts:
- ALWAYS implement double-vote prevention using local state
- ALWAYS include a way to close voting

For token sale contracts:
- ALWAYS validate payment transactions
- ALWAYS include proper asset transfer validation

For NFT contracts:
- ALWAYS validate asset IDs and amounts
- ALWAYS implement proper ownership checks

Your code should be production-ready, secure, and follow Algorand best practices.`
}
