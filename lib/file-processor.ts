/**
 * File processing utilities for handling file attachments in the chatbot
 */

import type { AttachedFile } from "@/components/file-attachment"

/**
 * Process attached files to extract text content and metadata
 * @param files Array of attached files
 * @returns Object containing extracted text content and metadata
 */
export async function processAttachedFiles(files: AttachedFile[]): Promise<{ textContent: string; metadata: string }> {
  let textContent = ""
  let metadata = `Attached ${files.length} file(s):\n`

  for (const file of files) {
    metadata += `- ${file.name} (${file.type || "unknown type"}, ${formatFileSize(file.size)})\n`

    // Process file content based on type
    if (file.content) {
      // For text-based files
      if (
        file.type?.startsWith("text/") ||
        file.name.endsWith(".py") ||
        file.name.endsWith(".js") ||
        file.name.endsWith(".ts") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".teal") ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".csv") ||
        file.name.endsWith(".html") ||
        file.name.endsWith(".css")
      ) {
        textContent += `\n\n--- File: ${file.name} ---\n\n`
        textContent += processFileContent(file.content, file.name)
      } else {
        // For binary files, just note their presence
        textContent += `\n\n--- Binary file: ${file.name} (content not displayed) ---\n`
      }
    }
  }

  return { textContent, metadata }
}

/**
 * Format file size in a human-readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes"
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

/**
 * Process file content to extract relevant information for AI context
 * @param fileContent The content of the file
 * @param fileName The name of the file
 * @returns Processed content with relevant information
 */
function processFileContent(fileContent: string, fileName: string): string {
  // Extract file extension
  const fileExt = fileName.split(".").pop()?.toLowerCase() || ""

  // Process based on file type
  switch (fileExt) {
    case "py":
      // For Python files, focus on imports, class/function definitions
      return extractPythonStructure(fileContent)
    case "js":
    case "ts":
      // For JavaScript/TypeScript files, focus on imports, exports, functions
      return extractJSStructure(fileContent)
    case "teal":
      // For TEAL files, keep everything as is (they're usually small)
      return fileContent
    case "json":
      // For JSON files, try to parse and summarize structure
      return summarizeJSON(fileContent)
    case "md":
      // For markdown files, extract headings and code blocks
      return extractMarkdownStructure(fileContent)
    default:
      // For other files, return as is if small, or truncate if large
      return fileContent.length > 1000 ? fileContent.substring(0, 1000) + "..." : fileContent
  }
}

// Helper functions for file processing
function extractPythonStructure(content: string): string {
  // Extract imports
  const importLines = content
    .split("\n")
    .filter((line) => line.trim().startsWith("import ") || line.trim().startsWith("from "))

  // Extract function and class definitions
  const defLines = content
    .split("\n")
    .filter((line) => line.trim().startsWith("def ") || line.trim().startsWith("class "))

  return ["# Imports", ...importLines, "", "# Definitions", ...defLines].join("\n")
}

function extractJSStructure(content: string): string {
  // Extract imports
  const importLines = content
    .split("\n")
    .filter(
      (line) =>
        line.trim().startsWith("import ") || line.trim().startsWith("const ") || line.trim().startsWith("function "),
    )

  // Extract function and class definitions
  const defLines = content
    .split("\n")
    .filter(
      (line) =>
        line.includes("function ") || line.includes("class ") || line.includes(" = (") || line.includes("export "),
    )

  return ["// Imports and key declarations", ...importLines, "", "// Functions and exports", ...defLines].join("\n")
}

function summarizeJSON(content: string): string {
  try {
    const json = JSON.parse(content)
    // Return stringified with 2 spaces for readability
    return JSON.stringify(json, null, 2)
  } catch (e) {
    // If parsing fails, return original content
    return content
  }
}

function extractMarkdownStructure(content: string): string {
  // Extract headings
  const headings = content.split("\n").filter((line) => line.trim().startsWith("#"))

  // Extract code blocks (simplified approach)
  const codeBlocks = content.match(/```[\s\S]*?```/g) || []

  return ["# Document Structure", ...headings, "", "# Code Blocks", ...codeBlocks].join("\n")
}
