/**
 * Extracts TEAL or PyTeal code from a message content string
 * @param content The message content to extract code from
 * @returns The extracted code or an empty string if no code is found
 */
export function extractTealCode(content: string): string {
  // Look for Python code blocks (which might contain PyTeal)
  const pythonMatch = content.match(/```python\n([\s\S]*?)```/)
  if (pythonMatch && pythonMatch[1]) {
    return pythonMatch[1].trim()
  }

  // Look for TEAL code blocks
  const tealMatch = content.match(/```teal\n([\s\S]*?)```/)
  if (tealMatch && tealMatch[1]) {
    return tealMatch[1].trim()
  }

  // Look for any code blocks if specific language blocks aren't found
  const codeMatch = content.match(/```(?:\w+)?\n([\s\S]*?)```/)
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1].trim()
  }

  return ""
}
