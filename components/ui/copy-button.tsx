"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CopyButtonProps {
  text: string
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  tooltipText?: string
  successText?: string
}

export function CopyButton({
  text,
  className = "",
  size = "sm",
  variant = "ghost",
  tooltipText = "Copy to clipboard",
  successText = "Copied!",
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size={size} className={`${className} transition-all`} onClick={handleCopy}>
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {size !== "icon" && <span className="ml-2">{isCopied ? successText : "Copy"}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCopied ? successText : tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
