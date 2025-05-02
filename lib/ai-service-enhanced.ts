import { fetchWebSearchResponse, simulateAIResponse } from "./ai-service"
import { enhancedValidateAndCorrectResponse } from "./enhanced-response-validator"
import { findMatchingTemplate, getTemplate } from "./pyteal-templates"
import { findRelevantConcepts } from "./pyteal-knowledge-base"
import type { AIServiceOptions } from "./types"
import type { AttachedFile } from "@/components/file-attachment"

/**
 * Enhanced AI service with PyTeal-specific improvements
 * @param query The user query
 * @param walletInfo Optional wallet information
 * @param files Optional attached files
 * @returns Enhanced AI response
 */
export async function enhancedFetchResponse(
  query: string,
  walletInfo?: AIServiceOptions["walletInfo"],
  files?: AttachedFile[],
): Promise<string> {
  // Check if this is a request for a specific template
  const templateMatch = query.match(/template\s+for\s+(.+)|(.+)\s+template/i)
  if (templateMatch) {
    const templateQuery = templateMatch[1] || templateMatch[2]
    const templateId = findMatchingTemplate(templateQuery)

    if (templateId) {
      const template = getTemplate(templateId)
      if (template) {
        return `# ${template.name}

${template.description}

This template includes the following features:
${template.features.map((f) => `- ${f}`).join("\n")}

\`\`\`python
${template.code}
\`\`\`

This is a verified template that follows Algorand best practices. You can use this as a starting point for your smart contract.`
      }
    }
  }

  // Check if this is a PyTeal-specific query
  const isPyTealQuery =
    query.toLowerCase().includes("pyteal") ||
    query.toLowerCase().includes("smart contract") ||
    query.toLowerCase().includes("teal")

  if (isPyTealQuery) {
    // Add PyTeal-specific context to the query
    const enhancedQuery = enhanceQueryWithPyTealContext(query)

    // Get response using the enhanced query
    let response
    try {
      response = await fetchWebSearchResponse(enhancedQuery, walletInfo, files)
    } catch (error) {
      console.error("Error with web search, falling back to client-side AI:", error)
      response = await simulateAIResponse(enhancedQuery, files)
    }

    // Validate and correct the response with PyTeal-specific validation
    const validatedResponse = await enhancedValidateAndCorrectResponse(query, response)

    return validatedResponse.response
  }

  // For non-PyTeal queries, use the standard response flow
  try {
    return await fetchWebSearchResponse(query, walletInfo, files)
  } catch (error) {
    console.error("Error with web search, falling back to client-side AI:", error)
    return await simulateAIResponse(query, files)
  }
}

/**
 * Enhance a query with PyTeal-specific context
 * @param query The original query
 * @returns Enhanced query with PyTeal context
 */
function enhanceQueryWithPyTealContext(query: string): string {
  // Find relevant PyTeal concepts
  const relevantConcepts = findRelevantConcepts(query)

  let enhancedQuery = query

  // Add concept information to the query
  if (relevantConcepts.length > 0) {
    enhancedQuery += "\n\nRelevant PyTeal concepts:"

    relevantConcepts.slice(0, 3).forEach((concept) => {
      enhancedQuery += `\n- ${concept.name}: ${concept.description}`
    })
  }

  // Add PyTeal best practices
  enhancedQuery += `\n\nPlease ensure the PyTeal code follows these best practices:
- Use Bytes() for global and local state keys
- Initialize global state in on_creation
- Include proper approval and clear state programs
- Validate all inputs and transaction parameters
- Prevent double-voting in voting contracts
- Use descriptive variable names
- Include comments explaining the logic
- Handle edge cases and potential errors`

  return enhancedQuery
}
