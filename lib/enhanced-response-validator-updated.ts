import { enhancedValidatePyTealCode, enhancedAutoFixPyTealCode } from "./pyteal-validator-enhanced"
import { findMatchingTemplate } from "./pyteal-templates-enhanced"
import { findRelevantConcepts } from "./pyteal-knowledge-base"
import { validateAndCorrectResponse } from "./response-validator"
import { updatedVotingTemplate } from "./pyteal-templates-updated"

/**
 * Enhanced response validator specifically for PyTeal code with improved validation
 * @param query The user query
 * @param response The AI response
 * @returns Validated and potentially corrected response
 */
export async function enhancedValidateAndCorrectResponse(
  query: string,
  response: string,
): Promise<{
  response: string
  wasModified: boolean
  validationDetails?: string
}> {
  // First, use the existing validator
  const initialValidation = await validateAndCorrectResponse(query, response)

  // If the response doesn't contain PyTeal code, return the initial validation
  if (!containsPyTealCode(response)) {
    return initialValidation
  }

  // Extract PyTeal code blocks
  const codeBlocks = extractPyTealCodeBlocks(response)

  if (codeBlocks.length === 0) {
    return initialValidation
  }

  let modifiedResponse = response
  let wasModified = initialValidation.wasModified
  let validationDetails = initialValidation.validationDetails || ""

  // Process each code block
  for (const codeBlock of codeBlocks) {
    // Use the enhanced validator
    const validationResult = enhancedValidatePyTealCode(codeBlock.code)

    if (!validationResult.isValid || validationResult.warnings.length > 0) {
      // Try to fix the code with enhanced fixes
      const fixedCode = enhancedAutoFixPyTealCode(codeBlock.code, validationResult)

      // If the code was modified, update the response
      if (fixedCode !== codeBlock.code) {
        modifiedResponse = modifiedResponse.replace(codeBlock.code, fixedCode)
        wasModified = true

        // Add validation details
        validationDetails +=
          "\n- Fixed PyTeal code issues: " +
          validationResult.errors.map((e) => e.message).join(", ") +
          validationResult.warnings.map((w) => w.message).join(", ")
      }
    }
  }

  // Check if we should suggest a template instead
  const isRequestingSmartContract =
    query.toLowerCase().includes("smart contract") ||
    query.toLowerCase().includes("pyteal") ||
    query.toLowerCase().includes("contract")

  // Check if specifically requesting a voting contract
  const isRequestingVotingContract =
    isRequestingSmartContract &&
    (query.toLowerCase().includes("voting") ||
      query.toLowerCase().includes("vote") ||
      query.toLowerCase().includes("ballot") ||
      query.toLowerCase().includes("election"))

  if (isRequestingVotingContract) {
    // If there are serious errors in the code, suggest the updated voting template
    const hasSerousErrors = codeBlocks.some((codeBlock) => {
      const validationResult = enhancedValidatePyTealCode(codeBlock.code)
      return validationResult.errors.length > 0
    })

    if (hasSerousErrors) {
      // Add a note about the updated voting template
      modifiedResponse += `\n\n---\n\n**Note**: I've detected some issues with the generated voting contract. Here's a verified template that follows Algorand best practices:\n\n\`\`\`python\n${updatedVotingTemplate.code}\n\`\`\`\n\nThis template includes proper state management, ABI support, and follows Algorand best practices.`
      wasModified = true
      validationDetails += "\n- Suggested updated voting template due to serious errors in the generated code."
    }
  } else if (isRequestingSmartContract) {
    const templateId = findMatchingTemplate(query)

    if (templateId) {
      // Add a note about the template at the end of the response
      modifiedResponse += `\n\n---\n\n**Note**: I've provided a custom implementation above, but we also have a verified template for this type of contract that you might find helpful. You can access it by asking for the "${templateId}" template.`
      wasModified = true
    }
  }

  // Add relevant PyTeal concepts if appropriate
  const relevantConcepts = findRelevantConcepts(query)

  if (relevantConcepts.length > 0 && !modifiedResponse.includes("Additional PyTeal Concepts")) {
    modifiedResponse += "\n\n### Additional PyTeal Concepts\n\n"

    // Add up to 3 relevant concepts
    relevantConcepts.slice(0, 3).forEach((concept) => {
      modifiedResponse += `**${concept.name}**: ${concept.description}\n\nExample:\n\`\`\`python\n${concept.examples[0]}\n\`\`\`\n\n`
    })

    wasModified = true
  }

  return {
    response: modifiedResponse,
    wasModified,
    validationDetails,
  }
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
    lowerResponse.includes("router") ||
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
      code.includes("Router(")
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
