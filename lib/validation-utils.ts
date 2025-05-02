/**
 * Utility functions for validating Algorand-specific content
 */

/**
 * Detects if a string contains Solidity code
 * @param text The text to check
 * @returns True if Solidity code is detected
 */
export function detectSolidityCode(text: string): boolean {
  const solidityPatterns = [
    /pragma\s+solidity/i,
    /contract\s+\w+\s*\{/i,
    /function\s+\w+\s*\(/i,
    /mapping\s*$$\s*\w+\s*=>\s*\w+\s*$$/i,
    /struct\s+\w+\s*\{/i,
    /event\s+\w+\s*\(/i,
    /modifier\s+\w+\s*\(/i,
    /address\s+public/i,
    /uint\d*\s+\w+/i,
    /bytes\d*\s+\w+/i,
    /msg\.sender/i,
    /require\s*\(/i,
    /constructor\s*\(/i,
    /emit\s+\w+/i,
    /ERC20|ERC721|ERC1155/i,
  ]

  // Check for language tags
  if (text.includes("```solidity") || (text.includes("```javascript") && text.includes("web3"))) {
    return true
  }

  // Check for Solidity patterns
  return solidityPatterns.some((pattern) => pattern.test(text))
}

/**
 * Detects if a string contains Algorand-specific code or concepts
 * @param text The text to check
 * @returns True if Algorand content is detected
 */
export function detectAlgorandCode(text: string): boolean {
  const algorandPatterns = [
    /pyteal/i,
    /from\s+pyteal\s+import/i,
    /\.teal/i,
    /App\.global(Get|Put)/i,
    /App\.local(Get|Put)/i,
    /Txn\.(sender|receiver|application_id|type_enum)/i,
    /algosdk/i,
    /AssetConfig/i,
    /ApplicationCall/i,
    /LogicSig/i,
    /TEAL/i,
    /Algorand\s+Standard\s+Asset/i,
    /ASA/i,
    /atomic\s+transfer/i,
    /stateful\s+smart\s+contract/i,
    /stateless\s+smart\s+contract/i,
    /ARC-\d+/i,
  ]

  // Check for language tags
  if (text.includes("```python") && (text.includes("pyteal") || text.includes("algosdk"))) {
    return true
  }

  if (text.includes("```teal")) {
    return true
  }

  // Check for Algorand patterns
  return algorandPatterns.some((pattern) => pattern.test(text))
}

/**
 * Validates if a response is Algorand-compatible
 * @param text The response text to validate
 * @returns Validation result with details
 */
export function validateAlgorandResponse(text: string): {
  isValid: boolean
  containsSolidity: boolean
  containsAlgorand: boolean
  details: string
} {
  const containsSolidity = detectSolidityCode(text)
  const containsAlgorand = detectAlgorandCode(text)

  // If it contains Solidity, it's not valid
  if (containsSolidity) {
    return {
      isValid: false,
      containsSolidity: true,
      containsAlgorand,
      details: "Response contains Solidity code which is not compatible with Algorand",
    }
  }

  // If it contains Algorand-specific content, it's valid
  if (containsAlgorand) {
    return {
      isValid: true,
      containsSolidity: false,
      containsAlgorand: true,
      details: "Response contains valid Algorand content",
    }
  }

  // If it doesn't contain either, it might be general information
  // We'll consider it valid but flag it as not containing Algorand-specific content
  return {
    isValid: true,
    containsSolidity: false,
    containsAlgorand: false,
    details: "Response doesn't contain Algorand-specific content but is not invalid",
  }
}
