"use client"

import type React from "react"

import { useState } from "react"
import { useWallet } from "@/lib/wallet-context"
import { ProcessingIndicator } from "./processing-indicator"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function EnhancedAMCPChat() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { walletInfo } = useWallet()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isProcessing) return

    // Add user message
    const userMessage: Message = { role: "user", content: query }
    setMessages((prev) => [...prev, userMessage])
    setQuery("")
    setIsProcessing(true)
    setError(null)

    try {
      // Call the enhanced API
      const response = await fetch("/api/chat-enhanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          walletInfo,
          previousMessages: messages,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Add assistant message
      const assistantMessage: Message = { role: "assistant", content: data.response }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error in chat:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${message.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"} max-w-3xl`}
          >
            <p className="font-semibold">{message.role === "user" ? "You" : "Algorand Assistant"}</p>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center">
            <ProcessingIndicator />
            <span className="ml-2">Processing your request...</span>
          </div>
        )}

        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">Error: {error}</div>}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about Algorand development..."
            className="flex-1 p-2 border rounded"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
