"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { RobotReadingIcon } from "@/components/ui/robot-reading-icon"

// ============================================
// TYPES
// ============================================
interface TutorMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string | null
  messages: TutorMessage[]
  resourceId: string | null
  createdAt: string
  updatedAt: string
}

interface TutorChatProps {
  resourceId?: string
  resourceTitle?: string
  isOpen?: boolean  // External control of open state (optional)
  onClose?: () => void  // Callback when close is requested
  className?: string
}

// Suggested prompts for quick actions
const SUGGESTED_PROMPTS = [
  { icon: "school", text: "Help me understand a concept", category: "Learning" },
  { icon: "quiz", text: "Quiz me on a topic", category: "Practice" },
  { icon: "lightbulb", text: "Explain this in simpler terms", category: "Clarification" },
  { icon: "explore", text: "What should I learn next?", category: "Guidance" },
]

// ============================================
// TUTOR CHAT COMPONENT
// ============================================
export function TutorChat({
  resourceId,
  resourceTitle,
  isOpen: externalIsOpen,
  onClose,
  className,
}: TutorChatProps) {
  // ============================================
  // STATE
  // ============================================
  // Internal state for uncontrolled mode (when no external isOpen is provided)
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = (value: boolean) => {
    if (externalIsOpen !== undefined) {
      // In controlled mode, just call onClose when trying to close
      if (!value && onClose) {
        onClose()
      }
    } else {
      // In uncontrolled mode, update internal state
      setInternalIsOpen(value)
    }
  }
  
  // Conversation management state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ============================================
  // EFFECTS
  // ============================================
  
  // Fetch conversations when chat opens
  useEffect(() => {
    if (isOpen) {
      if (resourceId) {
        // Resource-specific mode: fetch/create conversation for this resource
        fetchResourceConversation()
      } else {
        // General mode: fetch all conversations
        fetchConversations()
      }
    }
  }, [isOpen, resourceId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // ============================================
  // API FUNCTIONS
  // ============================================

  const fetchConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const response = await fetch("/api/tutor")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
        // If there are conversations, select the most recent one
        if (data.conversations?.length > 0) {
          selectConversation(data.conversations[0])
        } else {
          // No conversations, start fresh
          setCurrentConversation(null)
          setMessages([])
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err)
      setError("Failed to load conversations")
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const fetchResourceConversation = async () => {
    setIsLoadingConversations(true)
    try {
      const params = new URLSearchParams()
      if (resourceId) params.set("resourceId", resourceId)
      
      const response = await fetch(`/api/tutor?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (data.conversation) {
          setCurrentConversation(data.conversation)
          setMessages(data.conversation.messages || [])
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversation:", err)
      setError("Failed to load conversation")
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const selectConversation = async (conv: Conversation) => {
    try {
      const response = await fetch(`/api/tutor?conversationId=${conv.id}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentConversation(data.conversation)
        setMessages(data.conversation.messages || [])
      }
    } catch (err) {
      console.error("Failed to load conversation:", err)
      setError("Failed to load conversation")
    }
  }

  const startNewConversation = () => {
    setCurrentConversation(null)
    setMessages([])
    inputRef.current?.focus()
  }

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    setIsLoading(true)
    setError(null)
    
    // Optimistically add user message
    const userMessage: TutorMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          resourceId,
          conversationId: currentConversation?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      
      // Update current conversation if new
      if (!currentConversation) {
        const newConv: Conversation = {
          id: data.conversationId,
          title: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
          messages: [],
          resourceId: resourceId || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setCurrentConversation(newConv)
        
        // Refresh conversations list if not in resource-specific mode
        if (!resourceId) {
          fetchConversations()
        }
      }

      // Replace temp message with real ones
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== userMessage.id),
        userMessage,
        data.message,
      ])
    } catch (err) {
      setError("Failed to send message. Please try again.")
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/tutor?conversationId=${convId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== convId))
        if (currentConversation?.id === convId) {
          // Select another conversation or start fresh
          const remaining = conversations.filter((c) => c.id !== convId)
          if (remaining.length > 0) {
            selectConversation(remaining[0])
          } else {
            setCurrentConversation(null)
            setMessages([])
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err)
      setError("Failed to delete conversation")
    }
  }

  // ============================================
  // HANDLERS
  // ============================================

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  // ============================================
  // RENDER: Floating Button (Uncontrolled Mode Only)
  // ============================================
  // Only render the floating button in uncontrolled mode when closed
  // In controlled mode, FloatingAIButton handles the trigger
  if (!isOpen && externalIsOpen === undefined) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "size-16 bg-accent-cyan flex items-center justify-center",
          "border-2 border-accent-lime shadow-[4px_4px_0px_#CCFF00]",
          "hover:bg-white transition-all duration-300",
          "group",
          className
        )}
        title="AI Study Tutor"
        aria-label="Open AI Tutor"
      >
        <RobotReadingIcon 
          size={32}
          variant="holographic"
          animated={true}
          className="group-hover:scale-110 transition-transform" 
        />
        <span className="absolute -top-2 -right-2 size-5 bg-accent-lime flex items-center justify-center border border-accent-cyan animate-pulse">
          <span className="text-[8px] font-black text-black">AI</span>
        </span>
      </button>
    )
  }

  // ============================================
  // RENDER: Chat Panel (Both Modes)
  // ============================================
  if (!isOpen) {
    return null
  }

  return (
    <div
      className={cn(
        "w-[520px] h-[600px] max-h-[calc(100vh-180px)]",
        "bg-[#0a0a0a] border border-white/20",
        "flex overflow-hidden",
        "shadow-[8px_8px_0px_rgba(0,255,255,0.3)]",
        "animate-in slide-in-from-bottom-right duration-300",
        className
      )}
    >
      {/* ============================================ */}
      {/* SIDEBAR - Conversation History (Only in general mode) */}
      {/* ============================================ */}
      {!resourceId && (
        <div className={cn(
          "border-r border-white/10 bg-[#050505] flex flex-col transition-all duration-300",
          showSidebar ? "w-44" : "w-0 overflow-hidden"
        )}>
          {/* Sidebar Header */}
          <div className="p-3 border-b border-white/10">
            <button
              onClick={startNewConversation}
              className="w-full bg-accent-cyan text-black px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0px_#CCFF00] hover:bg-white transition-all flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Chat
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <div className="size-6 border-2 border-accent-cyan border-t-transparent animate-spin" />
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={cn(
                    "w-full text-left p-2 border transition-all group",
                    currentConversation?.id === conv.id
                      ? "bg-accent-cyan/10 border-accent-cyan/30"
                      : "border-white/5 hover:border-white/10 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white truncate font-medium">
                        {conv.title || "Untitled Chat"}
                      </p>
                      <p className="font-mono text-[8px] text-slate-500 uppercase">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-6 text-center">
                <span className="material-symbols-outlined text-xl text-slate-600 block mb-1">chat_bubble_outline</span>
                <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">
                  No chats yet
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MAIN CHAT AREA */}
      {/* ============================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#050505]">
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle (Only in general mode) */}
            {!resourceId && (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="size-8 flex items-center justify-center border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-base">
                  {showSidebar ? "menu_open" : "menu"}
                </span>
              </button>
            )}
            <div className="size-8 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
              <RobotReadingIcon size={18} variant="minimal" animated={false} />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-sm font-bold text-white italic">AI Tutor</h3>
              {resourceTitle && (
                <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest line-clamp-1 max-w-[150px]">
                  {resourceTitle.slice(0, 25)}...
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="size-8 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-6">
              <div className="size-12 mx-auto bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center mb-3">
                <RobotReadingIcon size={28} variant="holographic" animated={true} />
              </div>
              <h4 className="font-serif text-base font-bold text-white italic mb-1">
                Hi, I'm your AI Tutor!
              </h4>
              <p className="font-mono text-[10px] text-slate-500 max-w-[200px] mx-auto mb-4">
                Ask me anything or try a suggestion below.
              </p>
              
              {/* Suggested Prompts */}
              <div className="space-y-1.5">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.text)}
                    disabled={isLoading}
                    className="block w-full text-left px-3 py-2 border border-white/10 hover:border-accent-cyan/50 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent-cyan text-sm">{prompt.icon}</span>
                      <span className="font-mono text-[9px] text-slate-400">{prompt.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="size-6 shrink-0 bg-accent-cyan flex items-center justify-center border border-accent-lime">
                  <RobotReadingIcon size={14} variant="minimal" animated={false} />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] p-3",
                  message.role === "user"
                    ? "bg-accent-cyan/20 border border-accent-cyan/30"
                    : "bg-white/5 border border-white/10"
                )}
              >
                <div className="text-xs text-slate-200 whitespace-pre-wrap break-words">
                  {message.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-bold text-white mt-1 mb-0.5">{line.slice(2, -2)}</p>
                    }
                    if (line.startsWith('- ')) {
                      return <p key={i} className="ml-3 text-slate-300">• {line.slice(2)}</p>
                    }
                    if (line.startsWith('`') && line.endsWith('`')) {
                      return <code key={i} className="bg-white/10 px-1 py-0.5 text-accent-lime text-[10px]">{line.slice(1, -1)}</code>
                    }
                    return line ? <p key={i}>{line}</p> : <br key={i} />
                  })}
                </div>
                <p className="font-mono text-[8px] text-slate-600 mt-1.5">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === "user" && (
                <div className="size-6 shrink-0 bg-accent-lime flex items-center justify-center border border-accent-cyan">
                  <span className="material-symbols-outlined text-black text-xs">person</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="size-6 shrink-0 bg-accent-cyan flex items-center justify-center border border-accent-lime">
                <RobotReadingIcon size={14} variant="minimal" animated={false} />
              </div>
              <div className="bg-white/5 border border-white/10 p-3">
                <div className="flex gap-1">
                  <span className="size-1.5 bg-accent-cyan animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 bg-accent-cyan animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 bg-accent-cyan animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-white/10 bg-[#050505]">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                rows={2}
                className={cn(
                  "w-full bg-white/5 border border-white/10 p-2",
                  "text-white placeholder:text-slate-600",
                  "focus:outline-none focus:border-accent-cyan/50",
                  "resize-none font-sans text-xs",
                  "scrollbar-thin scrollbar-thumb-white/10"
                )}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={cn(
                "size-10 shrink-0 flex items-center justify-center",
                "bg-accent-cyan border-2 border-accent-lime",
                "shadow-[2px_2px_0px_#CCFF00]",
                "hover:bg-white transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-black text-base">
                {isLoading ? "hourglass_empty" : "send"}
              </span>
            </button>
          </div>
          <p className="font-mono text-[8px] text-slate-600 mt-1.5 text-center">
            Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
