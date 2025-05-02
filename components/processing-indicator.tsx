"use client"

import { useEffect, useState } from "react"
import { Terminal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProcessingIndicatorProps {
  message?: string
}

export default function ProcessingIndicator({ message = "Generating" }: ProcessingIndicatorProps) {
  const [dots, setDots] = useState(".")

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "."
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-lg bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)] text-[#E6F1FF]">
        <div className="flex items-start p-3">
          <Avatar className="h-8 w-8 mr-3 mt-0.5">
            <AvatarImage
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-atObPnDYIvadX5dr1ypYBjt9TqdamL.png"
              alt="Algorand Logo"
            />
            <AvatarFallback className="bg-[rgba(0,201,201,0.2)] text-[#00C9C9]">
              <Terminal className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-[#E6F1FF] font-medium">{message}</span>
                <span className="text-[#E6F1FF] min-w-[18px]">{dots}</span>
              </div>
              <span className="text-xs text-[#8892B0] mt-1">Algorand assistant is working</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
