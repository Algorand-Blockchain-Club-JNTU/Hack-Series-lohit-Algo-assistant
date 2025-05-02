import { fetchWebSearchResponse, simulateAIResponse } from "./ai-service"
import { enhancedValidateAndCorrectResponse } from "./enhanced-response-validator-updated"
import { findMatchingTemplate, getTemplate } from "./pyteal-templates-enhanced"
import { updatedVotingTemplate } from "./pyteal-templates-updated"
import type { AIServiceOptions } from "./types"
import type { AttachedFile } from "@/components/file-attachment"
import { generatePyTealPrompt, getPyTealSystemInstructions } from "./pyteal-prompt-engineering"

/**
 * Enhanced AI service with improved PyTeal-specific features
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

    // Check for specific voting template request
    if (templateQuery.toLowerCase().includes("voting") || templateQuery.toLowerCase().includes("vote")) {
      return `# ${updatedVotingTemplate.name}

${updatedVotingTemplate.description}

This template includes the following features:
${updatedVotingTemplate.features.map((f) => `- ${f}`).join("\n")}

\`\`\`python
${updatedVotingTemplate.code}
\`\`\`

This is a verified template that follows Algorand best practices. You can use this as a starting point for your voting smart contract.`
    }

    // Otherwise, look for other templates
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

  // Check if this is specifically about voting contracts
  const isVotingQuery =
    isPyTealQuery &&
    (query.toLowerCase().includes("voting") ||
      query.toLowerCase().includes("vote") ||
      query.toLowerCase().includes("ballot") ||
      query.toLowerCase().includes("election"))

  if (isPyTealQuery) {
    // Use the PyTeal prompt engineering for better results
    const enhancedQuery = isVotingQuery
      ? `Create a voting smart contract for Algorand using PyTeal with the following requirements:
- Proper state management using App.globalPut/App.globalGet
- Support for multiple voting options
- Prevention of double voting using local state
- ABI support for better interoperability
- Proper validation and error handling

Original query: ${query}`
      : generatePyTealPrompt(query)

    // Add system instructions for PyTeal code generation
    const systemInstructions = getPyTealSystemInstructions()

    // Get response using the enhanced query and system instructions
    let response
    try {
      // In a real implementation, you would pass the system instructions to the API
      response = await fetchWebSearchResponse(enhancedQuery, walletInfo, files)
    } catch (error) {
      console.error("Error with web search, falling back to client-side AI:", error)
      response = await simulateAIResponse(enhancedQuery, files)
    }

    // Validate and correct the response with enhanced PyTeal-specific validation
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
