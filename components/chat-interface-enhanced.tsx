"use client"

import type React from "react"

// Import the enhanced AI service
import { enhancedFetchResponse } from "@/lib/ai-service-enhanced"
import { validatePyTealCode } from "@/lib/pyteal-validator"
import { getAllTemplates } from "@/lib/pyteal-templates"
import { FileCode, AlertTriangle, CheckCircle } from "lucide-react"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"

// Define types
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface AttachedFile {
  name: string
  content: string
}

interface Session {
  id: string
  messages: Message[]
  title: string
}

// Define state variables (example - adjust as needed)
const activeSession: Session | null = null
const setSessions: React.Dispatch<React.SetStateAction<Session[]>> = () => {} // Dummy implementation
const setIsProcessing: React.Dispatch<React.SetStateAction<boolean>> = () => {} // Dummy implementation
const walletInfo: any = {} // Dummy implementation
const setActiveSession: React.Dispatch<React.SetStateAction<Session | null>> = () => {}
const updatedSessions: Session[] = []

// Add this to your existing ChatInterface component
export function PyTealTemplateSelector() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const templates = getAllTemplates()

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    // You would then use this template in your chat
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedTemplate === template.id
              ? "bg-[rgba(0,201,201,0.1)] border-[#00C9C9]"
              : "bg-[rgba(0,201,201,0.05)] border-[rgba(0,201,201,0.2)] hover:border-[rgba(0,201,201,0.4)]"
          }`}
          onClick={() => handleSelectTemplate(template.id)}
        >
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-[#00C9C9]" />
            <h3 className="font-medium text-[#E6F1FF]">{template.name}</h3>
          </div>
          <p className="text-sm text-[#8892B0] mt-2">{template.description}</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {template.features.slice(0, 3).map((feature, i) => (
              <span key={i} className="text-xs bg-[rgba(0,201,201,0.1)] text-[#00C9C9] px-2 py-1 rounded">
                {feature}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Add this to your existing ChatInterface component
export function PyTealCodeValidator({ code }: { code: string }) {
  const validationResult = validatePyTealCode(code)

  return (
    <div className="mt-4 p-4 rounded-lg bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
      <h3 className="font-medium text-[#E6F1FF] flex items-center">
        {validationResult.isValid ? (
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
        )}
        PyTeal Code Validation
      </h3>

      {validationResult.errors.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-red-400">Errors:</h4>
          <ul className="mt-1 space-y-1">
            {validationResult.errors.map((error, i) => (
              <li key={i} className="text-sm text-red-300 flex items-start">
                <AlertTriangle className="h-3 w-3 text-red-400 mr-1 mt-1 shrink-0" />
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationResult.warnings.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-amber-400">Warnings:</h4>
          <ul className="mt-1 space-y-1">
            {validationResult.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-amber-300 flex items-start">
                <AlertTriangle className="h-3 w-3 text-amber-400 mr-1 mt-1 shrink-0" />
                <span>{warning.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationResult.isValid && validationResult.warnings.length === 0 && (
        <p className="text-sm text-green-400 mt-2">No issues detected in the PyTeal code.</p>
      )}
    </div>
  )
}

// Update your handleSendMessage function to use the enhanced AI service
const handleSendMessage = async (message: string, files?: AttachedFile[]) => {
  if ((!message.trim() && (!files || files.length === 0)) || !activeSession) return

  // Create user message
  const userMessage: Message = {
    id: uuidv4(),
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  }

  // Update session with user message
  const updatedSession = {
    ...activeSession,
    messages: [...activeSession.messages, userMessage],
  }

  setSessions(updatedSessions)
  setActiveSession(updatedSession)
  setIsProcessing(true)

  try {
    // Use the enhanced AI service for PyTeal-aware responses
    const responseContent = await enhancedFetchResponse(message, walletInfo, files)

    const aiMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      content: responseContent,
      timestamp: new Date().toISOString(),
    }

    // Update session with AI response
    const finalSession = {
      ...updatedSession,
      messages: [...updatedSession.messages, aiMessage],
    }

    setSessions(finalSession)
    setActiveSession(finalSession)
  } catch (error) {
    // Error handling (unchanged)
  } finally {
    setIsProcessing(false)
  }
}
