"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles } from "lucide-react"
import { enhancePrompt } from "@/lib/ai-service"
import FileAttachment, { type AttachedFile } from "./file-attachment"

interface EnhancedChatInputProps {
  onSendMessage: (message: string, files?: AttachedFile[]) => void
  isProcessing: boolean
}

export default function EnhancedChatInput({ onSendMessage, isProcessing }: EnhancedChatInputProps) {
  const [message, setMessage] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [isEnhancing, setIsEnhancing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSendMessage = () => {
    if (message.trim() || attachedFiles.length > 0) {
      onSendMessage(message, attachedFiles.length > 0 ? attachedFiles : undefined)
      setMessage("")
      setAttachedFiles([])

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleRefinePrompt = () => {
    if (!message.trim()) return

    setIsEnhancing(true)

    // Simulate a delay for the enhancement process
    setTimeout(() => {
      const enhancedMessage = enhancePrompt(message)
      setMessage(enhancedMessage)
      setIsEnhancing(false)

      // Focus the textarea after enhancement
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 1000)
  }

  const handleAttachFiles = (files: AttachedFile[]) => {
    setAttachedFiles([...attachedFiles, ...files])
  }

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(attachedFiles.filter((file) => file.id !== fileId))
  }

  return (
    <div className="p-4">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Algorand development..."
          className="min-h-[60px] max-h-[200px] pr-24 bg-[#061525] border-[rgba(0,201,201,0.2)] text-[#E6F1FF] resize-none focus-visible:ring-[#00C9C9] focus-visible:ring-opacity-50"
          disabled={isProcessing || isEnhancing}
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <FileAttachment
            onAttach={handleAttachFiles}
            onRemove={handleRemoveFile}
            attachedFiles={attachedFiles}
            disabled={isProcessing || isEnhancing}
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
            onClick={handleRefinePrompt}
            disabled={!message.trim() || isProcessing || isEnhancing}
          >
            <Sparkles className={`h-4 w-4 ${isEnhancing ? "animate-pulse text-[#00C9C9]" : ""}`} />
          </Button>

          <Button
            onClick={handleSendMessage}
            size="icon"
            className="h-8 w-8 bg-[#00C9C9] text-[#020D19] hover:bg-[#00b5b5] disabled:bg-[rgba(0,201,201,0.3)]"
            disabled={(!message.trim() && attachedFiles.length === 0) || isProcessing || isEnhancing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {attachedFiles.length > 0 && (
        <div className="mt-2 text-xs text-[#8892B0]">{attachedFiles.length} file(s) attached</div>
      )}
    </div>
  )
}
