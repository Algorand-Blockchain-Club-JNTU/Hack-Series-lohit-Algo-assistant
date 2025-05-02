"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { simulateAIResponse, fetchWebSearchResponse, personalizeResponse } from "@/lib/ai-service"
import { useWallet } from "@/lib/wallet-context"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useOnlineStatus } from "@/hooks/use-online-status"
import type { Message, ChatSession } from "@/lib/types"
import {
  Trash2,
  Plus,
  BookOpen,
  FileCode,
  Wallet,
  AlertTriangle,
  Code,
  Menu,
  X,
  MessageSquare,
  Settings,
  ChevronRight,
  Terminal,
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import ReactMarkdown from "react-markdown"
import AlgorandEducationModal from "./algorand-education-modal"
import SmartContractSelector from "./smart-contract-selector"
import TealCompiler from "./teal-compiler"
import { getAlgorandExample } from "@/lib/algorand-examples"
import { extractTealCode } from "@/lib/code-extractor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CopyButton } from "@/components/ui/copy-button"
import AMCPContextDisplay from "./amcp-context-display"
import ProcessingIndicator from "./processing-indicator"
import AlgorandResources from "./algorand-resources"
import EnhancedChatInput from "./enhanced-chat-input"
import type { AttachedFile } from "./file-attachment"
import { processAttachedFiles } from "@/lib/file-processor"

export default function ChatInterface() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>("chat-sessions", [])
  const [showNewSessionInput, setShowNewSessionInput] = useState(false)
  const [newSessionName, setNewSessionName] = useState("")
  const [educationModalOpen, setEducationModalOpen] = useState(false)
  const [contractSelectorOpen, setContractSelectorOpen] = useState(false)
  const [tealCompilerOpen, setTealCompilerOpen] = useState(false)
  const [compilerCode, setCompilerCode] = useState("")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { walletInfo, connectWallet, disconnectWallet } = useWallet()
  const isOnline = useOnlineStatus()
  const [amcpContexts, setAmcpContexts] = useState<any[]>([])
  const [showAmcpContext, setShowAmcpContext] = useState(false)
  // Remove this line
  // const [showResources, setShowResources] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")

  // Create a default session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      const defaultSession: ChatSession = {
        id: uuidv4(),
        name: "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
      }
      setSessions([defaultSession])
      setActiveSession(defaultSession)
    } else if (!activeSession) {
      setActiveSession(sessions[0])
    }
  }, [sessions, activeSession, setSessions])

  // Scroll to bottom when messages change or when processing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeSession?.messages, isProcessing])

  // Close mobile sidebar when clicking outside on small screens
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("mobile-sidebar")
      if (sidebar && !sidebar.contains(event.target as Node) && mobileSidebarOpen) {
        setMobileSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [mobileSidebarOpen])

  // Update the handleSendMessage function to handle file attachments
  const handleSendMessage = async (message: string, files?: AttachedFile[]) => {
    if ((!message.trim() && (!files || files.length === 0)) || !activeSession) return

    // Set the current query for resources
    setCurrentQuery(message)

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

    // Update sessions list
    const updatedSessions = sessions.map((session) => (session.id === activeSession.id ? updatedSession : session))

    setSessions(updatedSessions)
    setActiveSession(updatedSession)
    setIsProcessing(true)

    // Reset AMCP contexts for new query
    setAmcpContexts([])

    try {
      // Try to get a response from the API
      let responseContent = ""

      if (isOnline) {
        try {
          // Process file attachments if any
          let fileContext = ""
          if (files && files.length > 0) {
            try {
              const { textContent, metadata } = await processAttachedFiles(files)
              fileContext = `\n\nFILE CONTEXT:\n${metadata}\n${textContent}`
            } catch (error) {
              console.error("Error processing file attachments:", error)
            }
          }

          // Combine the user's message with file context
          const enhancedQuery = message + fileContext

          // Pass the wallet info to the API
          responseContent = await fetchWebSearchResponse(enhancedQuery, walletInfo)
        } catch (error) {
          console.error("Error with web search, falling back to client-side AI:", error)
          // Fall back to client-side AI if web search fails
          responseContent = await simulateAIResponse(message, files)
        }
      } else {
        // Use client-side AI in offline mode
        responseContent = await simulateAIResponse(message, files)
      }

      // Personalize the response if wallet is connected
      if (walletInfo?.connected) {
        responseContent = personalizeResponse(responseContent, walletInfo)
      }

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

      // Update sessions list
      const finalSessions = sessions.map((session) => (session.id === activeSession.id ? finalSession : session))

      setSessions(finalSessions)
      setActiveSession(finalSession)
    } catch (error) {
      console.error("Error getting AI response:", error)

      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date().toISOString(),
        error: true,
      }

      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
      }

      const errorSessions = sessions.map((session) => (session.id === activeSession.id ? errorSession : session))

      setSessions(errorSessions)
      setActiveSession(errorSession)

      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateNewSession = () => {
    const name = newSessionName.trim() || "New Chat"
    const newSession: ChatSession = {
      id: uuidv4(),
      name,
      messages: [],
      createdAt: new Date().toISOString(),
    }

    setSessions([...sessions, newSession])
    setActiveSession(newSession)
    setShowNewSessionInput(false)
    setNewSessionName("")
    setMobileSidebarOpen(false)
  }

  const handleClearSession = () => {
    if (!activeSession) return

    const clearedSession = {
      ...activeSession,
      messages: [],
    }

    const updatedSessions = sessions.map((session) => (session.id === activeSession.id ? clearedSession : session))

    setSessions(updatedSessions)
    setActiveSession(clearedSession)

    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared from this chat.",
    })
  }

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter((session) => session.id !== sessionId)

    if (updatedSessions.length === 0) {
      // Create a new default session if we're deleting the last one
      const defaultSession: ChatSession = {
        id: uuidv4(),
        name: "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
      }
      setSessions([defaultSession])
      setActiveSession(defaultSession)
    } else {
      setSessions(updatedSessions)
      // If we're deleting the active session, set the first available one as active
      if (activeSession?.id === sessionId) {
        setActiveSession(updatedSessions[0])
      }
    }

    toast({
      title: "Chat Deleted",
      description: "The chat has been deleted.",
    })
  }

  const handleSelectSmartContract = (contractType: string) => {
    const example = getAlgorandExample(contractType)

    if (example && activeSession) {
      // Create a user message asking for this contract type
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: `Create a ${example.title} for Algorand`,
        timestamp: new Date().toISOString(),
      }

      // Create the assistant response with the example
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `Here's an example of ${example.title} for Algorand:

\`\`\`python
${example.code}
\`\`\`

${example.explanation}`,
        timestamp: new Date().toISOString(),
      }

      // Update the session with both messages
      const updatedSession = {
        ...activeSession,
        messages: [...activeSession.messages, userMessage, assistantMessage],
      }

      // Update sessions list
      const updatedSessions = sessions.map((session) => (session.id === activeSession.id ? updatedSession : session))

      setSessions(updatedSessions)
      setActiveSession(updatedSession)
    }
  }

  const handleOpenCompiler = (messageContent?: string) => {
    let code = ""

    if (messageContent) {
      // Extract TEAL or PyTeal code from the message
      code = extractTealCode(messageContent)
    }

    setCompilerCode(code)
    setTealCompilerOpen(true)
  }

  // Render code blocks with syntax highlighting
  const renderMarkdown = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          // Override the default rendering of paragraphs
          p: ({ children }) => {
            return <div className="my-4">{children}</div>
          },
          // Handle code blocks properly
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : "text"

            // Handle inline code
            if (inline) {
              return (
                <code className="bg-[rgba(0,201,201,0.1)] text-[#00C9C9] px-1 py-0.5 rounded" {...props}>
                  {children}
                </code>
              )
            }

            // Check if this is a TEAL or PyTeal code block
            const isTealCode = language === "python" || language === "teal"
            const codeContent = String(children).replace(/\n$/, "")

            // Handle code blocks with a simpler approach (no SyntaxHighlighter)
            return (
              <div className="relative group my-4">
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <div className="text-xs text-[#8892B0] bg-[rgba(2,13,25,0.7)] px-2 py-1 rounded">
                    {language === "python" ? "PyTeal/Python" : language === "teal" ? "TEAL" : language}
                  </div>

                  <CopyButton
                    text={codeContent}
                    size="icon"
                    className="h-7 w-7 rounded-full bg-[rgba(2,13,25,0.7)] text-[#00C9C9] opacity-0 group-hover:opacity-100 transition-opacity"
                    tooltipText="Copy code"
                    successText="Copied!"
                  />

                  {isTealCode && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full bg-[rgba(2,13,25,0.7)] text-[#00C9C9] opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleOpenCompiler(codeContent)}
                          >
                            <Terminal className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open in TEAL Compiler</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <pre className="bg-[rgba(2,13,25,0.7)] rounded-md p-4 overflow-x-auto text-[#E6F1FF] text-sm font-mono">
                  {codeContent}
                </pre>
              </div>
            )
          },
          // Ensure lists are properly handled
          ul: ({ children }) => {
            return <ul className="list-disc pl-6 my-4">{children}</ul>
          },
          ol: ({ children }) => {
            return <ol className="list-decimal pl-6 my-4">{children}</ol>
          },
          li: ({ children }) => {
            return <li className="my-1">{children}</li>
          },
          // Ensure proper heading styles
          h1: ({ children }) => {
            return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
          },
          h2: ({ children }) => {
            return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
          },
          h3: ({ children }) => {
            return <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>
          },
          // Handle pre tags directly to avoid nesting issues
          pre: ({ children }) => {
            return <>{children}</>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  return (
    <div className="flex h-screen bg-[#010A14]">
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden text-[#00C9C9]"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        id="mobile-sidebar"
        className={`${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 fixed md:relative z-40 w-72 h-full bg-[#0A1A2F] border-r border-[rgba(0,201,201,0.2)] flex flex-col`}
      >
        <div className="p-4 border-b border-[rgba(0,201,201,0.2)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#00C9C9] w-8 h-8 rounded-md flex items-center justify-center">
              <Terminal className="h-5 w-5 text-[#0A1A2F]" />
            </div>
            <h1 className="text-xl font-bold text-[#00C9C9]">AlgoAssist</h1>
          </div>

          {isOnline ? (
            <Badge variant="outline" className="bg-[rgba(16,185,129,0.1)] text-green-400 border-green-800">
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-[rgba(220,38,38,0.1)] text-red-400 border-red-800">
              Offline
            </Badge>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full border-[rgba(0,201,201,0.3)] bg-[rgba(0,201,201,0.05)] text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)] flex items-center justify-between"
              onClick={() => {
                setShowNewSessionInput(false)
                const newSession: ChatSession = {
                  id: uuidv4(),
                  name: "New Chat",
                  messages: [],
                  createdAt: new Date().toISOString(),
                }
                setSessions([...sessions, newSession])
                setActiveSession(newSession)
                setMobileSidebarOpen(false)
              }}
            >
              <span className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </Button>
          </div>

          <div className="px-3 py-2">
            <h2 className="text-xs font-semibold text-[#8892B0] uppercase tracking-wider px-1">Recent Chats</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group rounded-md cursor-pointer transition-all ${
                  activeSession?.id === session.id
                    ? "bg-[rgba(0,201,201,0.1)] text-[#E6F1FF]"
                    : "text-[#8892B0] hover:bg-[rgba(0,201,201,0.05)] hover:text-[#E6F1FF]"
                }`}
              >
                <div
                  className="flex items-center p-2"
                  onClick={() => {
                    setActiveSession(session)
                    setMobileSidebarOpen(false)
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-3 shrink-0" />
                  <span className="truncate flex-1">{session.name}</span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#0A1A2F] border-[rgba(0,201,201,0.2)] text-[#E6F1FF]"
                    >
                      <DropdownMenuItem
                        className="hover:bg-[rgba(0,201,201,0.1)] cursor-pointer"
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-[rgba(0,201,201,0.2)]" />

          <div className="p-3 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#8892B0] hover:bg-[rgba(0,201,201,0.05)] hover:text-[#E6F1FF]"
              onClick={() => {
                setEducationModalOpen(true)
                setMobileSidebarOpen(false)
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Algorand Guide
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-[#8892B0] hover:bg-[rgba(0,201,201,0.05)] hover:text-[#E6F1FF]"
              onClick={() => {
                setContractSelectorOpen(true)
                setMobileSidebarOpen(false)
              }}
            >
              <FileCode className="h-4 w-4 mr-2" />
              Smart Contracts
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-[#8892B0] hover:bg-[rgba(0,201,201,0.05)] hover:text-[#E6F1FF]"
              onClick={() => {
                setTealCompilerOpen(true)
                setMobileSidebarOpen(false)
              }}
            >
              <Code className="h-4 w-4 mr-2" />
              TEAL Compiler
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Status Bar */}
        <div className="bg-[#0A1A2F] border-b border-[rgba(0,201,201,0.2)] p-3 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-[#E6F1FF] mr-4 ml-12 md:ml-0">
              {activeSession?.name || "Chat"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {!isOnline && (
              <div className="flex items-center text-amber-500 text-xs mr-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Offline Mode</span>
              </div>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                    onClick={handleClearSession}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                    onClick={() => setTealCompilerOpen(true)}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>TEAL Compiler</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeSession?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="bg-[#00C9C9] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Terminal className="h-8 w-8 text-[#0A1A2F]" />
              </div>
              <h2 className="text-xl font-bold text-[#E6F1FF] mb-2">Welcome to AlgoAssist</h2>
              <p className="text-[#8892B0] max-w-md mb-6">
                Your AI assistant for Algorand blockchain development. Ask questions, get code examples, and compile
                TEAL smart contracts.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
                <Button
                  variant="outline"
                  className="border-[rgba(0,201,201,0.3)] bg-[rgba(0,201,201,0.05)] text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                  onClick={() => setEducationModalOpen(true)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Algorand Guide
                </Button>
                <Button
                  variant="outline"
                  className="border-[rgba(0,201,201,0.3)] bg-[rgba(0,201,201,0.05)] text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                  onClick={() => setContractSelectorOpen(true)}
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  Smart Contracts
                </Button>
                <Button
                  variant="outline"
                  className="border-[rgba(0,201,201,0.3)] bg-[rgba(0,201,201,0.05)] text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                  onClick={() => setTealCompilerOpen(true)}
                >
                  <Code className="h-4 w-4 mr-2" />
                  TEAL Compiler
                </Button>
                <Button
                  variant="outline"
                  className="border-[rgba(0,201,201,0.3)] bg-[rgba(0,201,201,0.05)] text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                  onClick={walletInfo?.connected ? undefined : connectWallet}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {walletInfo?.connected ? "Wallet Connected" : "Connect Wallet"}
                </Button>
              </div>
            </div>
          ) : (
            activeSession?.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg ${
                    message.role === "user"
                      ? "bg-[#00C9C9] text-[#020D19]"
                      : message.error
                        ? "bg-[rgba(220,38,38,0.1)] border border-red-800 text-[#E6F1FF]"
                        : "bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)] text-[#E6F1FF]"
                  }`}
                >
                  <div className="flex items-start p-3">
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 mr-3 mt-0.5">
                        <AvatarImage
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-atObPnDYIvadX5dr1ypYBjt9TqdamL.png"
                          alt="Algorand Logo"
                        />
                        <AvatarFallback className="bg-[rgba(0,201,201,0.2)] text-[#00C9C9]">
                          <Terminal className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex-1 overflow-hidden">
                      {message.role === "user" ? (
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                          {message.role === "user" && (
                            <div className="flex justify-end mt-1">
                              <CopyButton
                                text={message.content}
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs text-[rgba(2,13,25,0.7)] hover:text-[#020D19] opacity-0 group-hover:opacity-100 transition-opacity"
                                tooltipText="Copy message"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="markdown-content">{renderMarkdown(message.content)}</div>
                          <div className="flex justify-end mt-1">
                            <CopyButton
                              text={message.content}
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs text-[#8892B0] hover:text-[#E6F1FF] opacity-0 group-hover:opacity-100 transition-opacity"
                              tooltipText="Copy entire response"
                            />
                          </div>
                        </>
                      )}
                      <div
                        className={`text-xs mt-2 ${message.role === "user" ? "text-[rgba(2,13,25,0.7)]" : "text-[#8892B0]"}`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 ml-3 mt-0.5">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-[rgba(2,13,25,0.3)] text-[#020D19]">
                          {walletInfo?.connected ? walletInfo.address?.substring(0, 2) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {message.role === "assistant" && message.content.includes("```") && (
                    <div className="px-3 pb-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                        onClick={() => handleOpenCompiler(message.content)}
                      >
                        <Code className="h-3.5 w-3.5 mr-1.5" />
                        Open in Compiler
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isProcessing && <ProcessingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Using our new EnhancedChatInput component */}
        <div className="border-t border-[rgba(0,201,201,0.2)] bg-[#0A1A2F]">
          {/* Remove this block
          {currentQuery && (
            <div className="px-4 pt-3">
              <AlgorandResources
                query={currentQuery}
                isVisible={showResources}
                onToggleVisibility={() => setShowResources(!showResources)}
              />
            </div>
          )}
          */}

          {/* Add the AlgorandResources component directly */}
          <div className="px-4 pt-3">
            <AlgorandResources query="" isVisible={false} onToggleVisibility={() => {}} />
          </div>

          {amcpContexts.length > 0 && (
            <div className="px-4 pt-3">
              <AMCPContextDisplay
                contexts={amcpContexts}
                isVisible={showAmcpContext}
                onToggleVisibility={() => setShowAmcpContext(!showAmcpContext)}
              />
            </div>
          )}
          <EnhancedChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
        </div>
      </div>

      {/* Education Modal */}
      <AlgorandEducationModal isOpen={educationModalOpen} onClose={() => setEducationModalOpen(false)} />

      {/* Smart Contract Selector */}
      <SmartContractSelector
        isOpen={contractSelectorOpen}
        onClose={() => setContractSelectorOpen(false)}
        onSelect={handleSelectSmartContract}
      />

      {/* TEAL Compiler */}
      <TealCompiler isOpen={tealCompilerOpen} onClose={() => setTealCompilerOpen(false)} initialCode={compilerCode} />
    </div>
  )
}
