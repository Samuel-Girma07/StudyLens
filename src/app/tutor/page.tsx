"use client"

import { useState, useEffect, useRef } from "react"
import { AppLayout } from "@/components/shared"
import { cn } from "@/lib/utils"
import Link from "next/link"

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

// Suggested prompts for quick actions
const SUGGESTED_PROMPTS = [
  { icon: "school", text: "Help me understand a concept", category: "Learning" },
  { icon: "quiz", text: "Quiz me on a topic", category: "Practice" },
  { icon: "lightbulb", text: "Explain this in simpler terms", category: "Clarification" },
  { icon: "explore", text: "What should I learn next?", category: "Guidance" },
]

// ============================================
// TUTOR PAGE COMPONENT
// ============================================
export default function TutorPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when conversation is loaded
  useEffect(() => {
    if (currentConversation) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [currentConversation])

  const fetchConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const response = await fetch("/api/tutor")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const startNewConversation = () => {
    setCurrentConversation(null)
    setMessages([])
    inputRef.current?.focus()
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
    }
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
          conversationId: currentConversation?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      
      // Update current conversation if new
      if (!currentConversation) {
        setCurrentConversation({ id: data.conversationId, messages: [], title: "New Chat", resourceId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
        // Refresh conversations list
        fetchConversations()
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
          setCurrentConversation(null)
          setMessages([])
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Conversation History */}
        <div className={cn(
          "border-r border-white/10 bg-[#050505] flex flex-col transition-all duration-300",
          showSidebar ? "w-72" : "w-0 overflow-hidden"
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10">
            <button
              onClick={startNewConversation}
              className="w-full bg-accent-cyan text-black px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Chat
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <div className="size-8 border-2 border-accent-cyan border-t-transparent animate-spin" />
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={cn(
                    "w-full text-left p-4 border transition-all group",
                    currentConversation?.id === conv.id
                      ? "bg-accent-cyan/10 border-accent-cyan/30"
                      : "border-white/5 hover:border-white/10 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate mb-1">
                        {conv.title || "Untitled Chat"}
                      </p>
                      <p className="font-mono text-[9px] text-slate-500 uppercase">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                  {conv.messages[0] && (
                    <p className="text-xs text-slate-400 truncate mt-2">
                      {conv.messages[0].content.slice(0, 50)}...
                    </p>
                  )}
                </button>
              ))
            ) : (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-600 block mb-2">chat_bubble_outline</span>
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                  No conversations yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="border-b border-white/10 p-4 bg-[#050505] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="size-10 flex items-center justify-center border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">
                  {showSidebar ? "menu_open" : "menu"}
                </span>
              </button>
              <div className="flex items-center gap-3">
                <div className="size-10 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
                  <span className="material-symbols-outlined text-black font-bold">psychology</span>
                </div>
                <div>
                  <h1 className="font-serif text-xl font-bold text-white italic">AI Study Tutor</h1>
                  <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                    Your personal learning assistant
                  </p>
                </div>
              </div>
            </div>
            <Link href="/">
              <button className="px-4 py-2 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all font-mono text-xs uppercase tracking-widest">
                Back to Dashboard
              </button>
            </Link>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Welcome Screen */}
            {messages.length === 0 && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="size-24 mx-auto bg-accent-cyan/10 border-2 border-accent-cyan/30 flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-accent-cyan text-5xl">school</span>
                </div>
                <h2 className="font-serif text-4xl font-black text-white italic tracking-tighter mb-4">
                  Hi, I'm your <span className="text-accent-cyan">AI Tutor!</span>
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto mb-12">
                  I'm here to help you learn. Ask me anything about your studies, get explanations, 
                  practice with quizzes, or explore new topics.
                </p>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt.text)}
                      disabled={isLoading}
                      className="group p-4 border border-white/10 hover:border-accent-cyan/50 hover:bg-white/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-accent-cyan">{prompt.icon}</span>
                        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                          {prompt.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                        {prompt.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="size-10 shrink-0 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
                      <span className="material-symbols-outlined text-black text-lg">psychology</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] p-5",
                      message.role === "user"
                        ? "bg-accent-cyan/10 border border-accent-cyan/30"
                        : "bg-[#0a0a0a] border border-white/10"
                    )}
                  >
                    <div className="text-sm text-slate-200 whitespace-pre-wrap break-words prose prose-invert prose-sm max-w-none">
                      {message.content.split('\n').map((line, i) => {
                        // Simple markdown-like formatting
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-bold text-white mt-2 mb-1">{line.slice(2, -2)}</p>
                        }
                        if (line.startsWith('- ')) {
                          return <p key={i} className="ml-4">• {line.slice(2)}</p>
                        }
                        if (line.startsWith('`') && line.endsWith('`')) {
                          return <code key={i} className="bg-white/10 px-1 py-0.5 text-accent-lime">{line.slice(1, -1)}</code>
                        }
                        return line ? <p key={i}>{line}</p> : <br key={i} />
                      })}
                    </div>
                    <p className="font-mono text-[9px] text-slate-600 mt-3">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="size-10 shrink-0 bg-accent-lime flex items-center justify-center border-2 border-accent-cyan shadow-[2px_2px_0px_#00FFFF]">
                      <span className="material-symbols-outlined text-black text-lg">person</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="size-10 shrink-0 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
                    <span className="material-symbols-outlined text-black text-lg">psychology</span>
                  </div>
                  <div className="bg-[#0a0a0a] border border-white/10 p-5">
                    <div className="flex gap-2">
                      <span className="size-3 bg-accent-cyan animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="size-3 bg-accent-cyan animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="size-3 bg-accent-cyan animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 max-w-md mx-auto">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-4 bg-[#050505]">
            <div className="max-w-3xl mx-auto flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your studies..."
                  disabled={isLoading}
                  rows={2}
                  className={cn(
                    "w-full bg-white/5 border border-white/10 p-4",
                    "text-white placeholder:text-slate-600",
                    "focus:outline-none focus:border-accent-cyan/50",
                    "resize-none font-sans text-sm",
                    "scrollbar-thin scrollbar-thumb-white/10"
                  )}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className={cn(
                  "size-14 shrink-0 flex items-center justify-center",
                  "bg-accent-cyan border-2 border-accent-lime",
                  "shadow-[4px_4px_0px_#CCFF00]",
                  "hover:bg-white transition-all",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span className="material-symbols-outlined text-black text-xl">
                  {isLoading ? "hourglass_empty" : "send"}
                </span>
              </button>
            </div>
            <p className="font-mono text-[9px] text-slate-600 mt-3 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
