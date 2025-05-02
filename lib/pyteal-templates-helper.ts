import { findMatchingTemplate, getTemplate } from "./pyteal-templates"

/**
 * Get a template by name or keyword
 * @param nameOrKeyword The template name or a keyword to match
 * @returns The template or null if not found
 */
export function getTemplateByNameOrKeyword(nameOrKeyword: string) {
  // Try to find a matching template
  const templateId = findMatchingTemplate(nameOrKeyword)
  if (!templateId) return null

  // Get the template
  return getTemplate(templateId)
}

/**
 * Get all available template names
 * @returns Array of template names
 */
export function getAllTemplateNames(): string[] {
  // This is a placeholder - in a real implementation, you would get this from the templates module
  return ["voting", "auction", "escrow", "token", "nft", "dao"]
}

/**
 * Check if a template exists
 * @param name The template name
 * @returns True if the template exists
 */
export function templateExists(name: string): boolean {
  return !!findMatchingTemplate(name)
}

/**
 * Get template features
 * @param name The template name
 * @returns Array of features or empty array if template not found
 */
export function getTemplateFeatures(name: string): string[] {
  const template = getTemplateByNameOrKeyword(name)
  return template?.features || []
}

/**
 * Get template complexity
 * @param name The template name
 * @returns Complexity level or null if template not found
 */
export function getTemplateComplexity(name: string): string | null {
  const template = getTemplateByNameOrKeyword(name)
  return template?.complexity || null
}

/**
 * Get template code
 * @param name The template name
 * @returns Template code or null if template not found
 */
export function getTemplateCode(name: string): string | null {
  const template = getTemplateByNameOrKeyword(name)
  return template?.code || null
}

/**
 * Get template description
 * @param name The template name
 * @returns Template description or null if template not found
 */
export function getTemplateDescription(name: string): string | null {
  const template = getTemplateByNameOrKeyword(name)
  return template?.description || null
}
