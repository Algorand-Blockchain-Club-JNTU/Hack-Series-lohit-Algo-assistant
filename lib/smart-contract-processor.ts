import { validateSmartContract, autoFixSmartContract } from "./smart-contract-validator"
import { getVotingContractTemplate } from "./voting-contract-template"

/**
 * Process and enhance a smart contract response
 * @param query The original user query
 * @param response The AI-generated response
 * @returns Enhanced response with corrected smart contract code
 */
export function processSmartContractResponse(query: string, response: string): string {
  // Check if the response contains PyTeal code
  if (!containsPyTealCode(response)) {
    return response
  }

  // Extract PyTeal code blocks
  const codeBlocks = extractPyTealCodeBlocks(response)

  if (codeBlocks.length === 0) {
    return response
  }

  let enhancedResponse = response
  let wasModified = false
  let validationDetails = ""

  // Process each code block
  for (const codeBlock of codeBlocks) {
    // Validate the code
    const validationResult = validateSmartContract(codeBlock.code)

    if (!validationResult.isValid || validationResult.warnings.length > 0) {
      // Try to fix the code
      const fixedCode = autoFixSmartContract(codeBlock.code, validationResult)

      // If the code was modified, update the response
      if (fixedCode !== codeBlock.code) {
        enhancedResponse = enhancedResponse.replace(codeBlock.code, fixedCode)
        wasModified = true

        // Add validation details
        validationDetails +=
          "\n- Fixed smart contract issues: " +
          validationResult.errors.map((e) => e.message).join(", ") +
          validationResult.warnings.map((w) => w.message).join(", ")
      }
    }
  }

  // Check if this is a voting contract request
  const isVotingContractRequest = isVotingQuery(query)

  // If there are serious errors in the code and it's a voting contract request,
  // suggest the corrected voting contract template
  if (isVotingContractRequest) {
    const hasSerousErrors = codeBlocks.some((codeBlock) => {
      const validationResult = validateSmartContract(codeBlock.code)
      return validationResult.errors.length > 0
    })

    if (hasSerousErrors) {
      // Add a note about the corrected voting contract template
      enhancedResponse += `

---

**Note**: I've detected some issues with the generated voting contract. Here's a corrected template that follows Algorand best practices:

\`\`\`python
${getVotingContractTemplate()}
\`\`\`

This template includes proper state management, type conversions, and follows Algorand best practices.`
      wasModified = true
    }
  }

  return enhancedResponse
}

/**
 * Check if a response contains PyTeal code
 * @param response The response to check
 * @returns True if the response contains PyTeal code
 */
function containsPyTealCode(response: string): boolean {
  const lowerResponse = response.toLowerCase()

  return (
    lowerResponse.includes("pyteal") ||
    lowerResponse.includes("from pyteal import") ||
    lowerResponse.includes("app.globalput") ||
    lowerResponse.includes("app.localput") ||
    (lowerResponse.includes("approval_program") && lowerResponse.includes("clear_state_program"))
  )
}

/**
 * Extract PyTeal code blocks from a response
 * @param response The response to extract code blocks from
 * @returns Array of code blocks with their positions
 */
function extractPyTealCodeBlocks(response: string): Array<{ code: string; start: number; end: number }> {
  const codeBlocks: Array<{ code: string; start: number; end: number }> = []

  // Match code blocks with python or no language specified
  const codeBlockRegex = /```(?:python|pyteal)?\n([\s\S]*?)```/g
  let match

  while ((match = codeBlockRegex.exec(response)) !== null) {
    const code = match[1]

    // Check if it's likely PyTeal code
    if (
      code.includes("pyteal") ||
      code.includes("App.global") ||
      code.includes("App.local") ||
      code.includes("approval_program") ||
      code.includes("clear_state_program")
    ) {
      codeBlocks.push({
        code,
        start: match.index + match[0].indexOf(code),
        end: match.index + match[0].indexOf(code) + code.length,
      })
    }
  }

  return codeBlocks
}

/**
 * Check if a query is asking for a voting contract
 * @param query The query to check
 * @returns True if the query is asking for a voting contract
 */
function isVotingQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase()

  return (
    (lowerQuery.includes("voting") ||
      lowerQuery.includes("vote") ||
      lowerQuery.includes("ballot") ||
      lowerQuery.includes("election")) &&
    (lowerQuery.includes("contract") || lowerQuery.includes("smart contract") || lowerQuery.includes("pyteal"))
  )
}
