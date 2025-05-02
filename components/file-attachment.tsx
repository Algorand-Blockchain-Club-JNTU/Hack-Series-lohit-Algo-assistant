"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X, File, FileText, FileCode, Image, FileSpreadsheet } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface AttachedFile {
  id: string
  name: string
  type: string
  size: number
  content: string
}

interface FileAttachmentProps {
  onAttach: (files: AttachedFile[]) => void
  onRemove: (fileId: string) => void
  attachedFiles: AttachedFile[]
  disabled?: boolean
}

export default function FileAttachment({ onAttach, onRemove, attachedFiles, disabled = false }: FileAttachmentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsLoading(true)
    const newFiles: AttachedFile[] = []

    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i]

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 5MB.`)
          continue
        }

        // Read file content
        const content = await readFileContent(file)

        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          content,
        })
      }

      if (newFiles.length > 0) {
        onAttach(newFiles)
      }
    } catch (error) {
      console.error("Error reading files:", error)
      alert("Error reading files. Please try again.")
    } finally {
      setIsLoading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string)
        } else {
          reject(new Error("Failed to read file"))
        }
      }

      reader.onerror = () => {
        reject(reader.error)
      }

      // Read as text for text files, as DataURL for binary files
      if (
        file.type.startsWith("text/") ||
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
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <Image className="h-4 w-4" />
    } else if (
      fileName.endsWith(".py") ||
      fileName.endsWith(".js") ||
      fileName.endsWith(".ts") ||
      fileName.endsWith(".teal")
    ) {
      return <FileCode className="h-4 w-4" />
    } else if (fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".json")) {
      return <FileText className="h-4 w-4" />
    } else if (fileName.endsWith(".csv") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      return <FileSpreadsheet className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept=".py,.js,.ts,.json,.md,.teal,.txt,.csv,.html,.css,image/*"
        disabled={disabled || isLoading}
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Attach files</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-1 bg-[rgba(0,201,201,0.1)] text-[#E6F1FF] text-xs rounded px-2 py-1"
            >
              {getFileIcon(file.name, file.type)}
              <span className="max-w-[100px] truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 text-[#8892B0] hover:text-[#E6F1FF] hover:bg-transparent"
                onClick={() => onRemove(file.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
