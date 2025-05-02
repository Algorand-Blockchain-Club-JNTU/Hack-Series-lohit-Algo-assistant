/**
 * Integration of all enhanced PyTeal features
 */

import { addUpdatedTemplates } from "./pyteal-templates-updated"
import { getAllTemplates } from "./pyteal-templates-enhanced"
import { enhancedFetchResponse } from "./ai-service-enhanced-updated"
import { runEnhancedAutomatedTests } from "./pyteal-testing-enhanced"

/**
 * Initialize all enhanced PyTeal features
 */
export function initializeEnhancedPyTealFeatures(): void {
  // Add updated templates to the template registry
  addUpdatedTemplates(getAllTemplates())

  console.log("Enhanced PyTeal features initialized")
}

/**
 * Process a user query with enhanced PyTeal features
 * @param query The user query
 * @param walletInfo Optional wallet information
 * @param files Optional attached files
 * @returns Enhanced AI response
 */
export async function processQueryWithEnhancedFeatures(
  query: string,
  walletInfo?: any,
  files?: any[],
): Promise<string> {
  return enhancedFetchResponse(query, walletInfo, files)
}

/**
 * Test PyTeal code with enhanced testing
 * @param code The PyTeal code to test
 * @returns Enhanced test results
 */
export async function testPyTealCodeWithEnhancedTesting(code: string): Promise<any> {
  return runEnhancedAutomatedTests(code)
}
