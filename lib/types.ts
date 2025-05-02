export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  error?: boolean
}

export interface ChatSession {
  id: string
  name: string
  messages: Message[]
  createdAt: string
}

export interface AIServiceOptions {
  walletInfo?: {
    connected: boolean
    address?: string
    balance?: number
    network?: string
    assets?: Array<{
      id: number
      name: string
      amount: number
      decimals: number
    }>
  } | null
}
