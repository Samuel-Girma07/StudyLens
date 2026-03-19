import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { getNVIDIAClient, ChatMessage } from "@/lib/nvidia-ai"

// ============================================
// AI TUTOR SYSTEM PROMPT
// ============================================
const TUTOR_SYSTEM_PROMPT = `You are an expert AI Study Tutor for StudyLens, a learning platform. Your role is to:

1. **Explain Concepts**: Break down complex topics into simple, understandable parts. Use analogies and real-world examples.

2. **Answer Questions**: Provide clear, accurate, and educational answers. If you don't know something, admit it honestly.

3. **Provide Learning Guidance**: Suggest study strategies, recommend practice exercises, and help create learning plans.

4. **Quiz & Test**: When asked, create practice questions to test understanding. Provide feedback on answers.

5. **Encourage Critical Thinking**: Ask follow-up questions to deepen understanding rather than just giving answers.

**Guidelines:**
- Be friendly, patient, and encouraging
- Adapt your explanations to the user's apparent knowledge level
- Use formatting (bold, lists, code blocks) to make responses readable
- Keep responses focused and not overly long
- If discussing a specific resource, reference its content when relevant
- Suggest related topics to explore when appropriate

**Response Format:**
- Use clear headings with **bold** text
- Use bullet points for lists
- Use \`code blocks\` for code or technical terms
- End with a thought-provoking question or suggestion when appropriate

Remember: Your goal is to help the user LEARN, not just give them answers. Guide them to understanding.`

// Maximum messages to keep in context (to avoid token limits)
const MAX_CONTEXT_MESSAGES = 20

// ============================================
// GET - Retrieve conversation history
// ============================================
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get("resourceId")
    const conversationId = searchParams.get("conversationId")

    // If conversationId is provided, get that specific conversation
    if (conversationId) {
      const conversation = await db.tutorConversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      })

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      return NextResponse.json({ conversation })
    }

    // If resourceId is provided, get or create conversation for that resource
    if (resourceId) {
      let conversation = await db.tutorConversation.findFirst({
        where: {
          userId: user.id,
          resourceId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
      })

      // Create new conversation if none exists
      if (!conversation) {
        const resource = await db.resource.findUnique({
          where: { id: resourceId },
          select: { title: true },
        })

        conversation = await db.tutorConversation.create({
          data: {
            userId: user.id,
            resourceId,
            title: resource ? `Chat about: ${resource.title.slice(0, 50)}...` : "Resource Chat",
          },
          include: {
            messages: true,
          },
        })
      }

      return NextResponse.json({ conversation })
    }

    // Otherwise, list all conversations for the user
    const conversations = await db.tutorConversation.findMany({
      where: {
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Just get the last message for preview
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error in tutor GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ============================================
// POST - Send message and get AI response
// ============================================
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { message, resourceId, conversationId } = body

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await db.tutorConversation.findFirst({
        where: { id: conversationId, userId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: MAX_CONTEXT_MESSAGES,
          },
        },
      })
    }

    if (!conversation && resourceId) {
      // Create new conversation for this resource
      const resource = await db.resource.findUnique({
        where: { id: resourceId },
        select: { title: true, description: true, subject: true, type: true, difficulty: true },
      })

      conversation = await db.tutorConversation.create({
        data: {
          userId: user.id,
          resourceId,
          title: resource ? `Chat about: ${resource.title.slice(0, 50)}...` : "Resource Chat",
        },
        include: { messages: true },
      })
      
      // Add resource context to the conversation
      if (resource) {
        conversation = {
          ...conversation,
          resource,
        } as typeof conversation & { resource: typeof resource }
      }
    }

    // If still no conversation, create a new general conversation
    // This handles the case when user starts a new chat from /tutor page
    if (!conversation) {
      // Generate title from first message (truncated to 50 chars)
      const generatedTitle = message.trim().length > 50 
        ? message.trim().slice(0, 47) + "..." 
        : message.trim()
      
      conversation = await db.tutorConversation.create({
        data: {
          userId: user.id,
          resourceId: null, // General chat, no resource attached
          title: generatedTitle,
        },
        include: { messages: true },
      })
    }

    // Get resource details for context (if applicable)
    let resourceContext = ""
    if (conversation.resourceId) {
      const resource = await db.resource.findUnique({
        where: { id: conversation.resourceId },
        select: { title: true, description: true, subject: true, type: true, difficulty: true, author: true },
      })
      if (resource) {
        resourceContext = `\n\n**Current Resource Context:**
- Title: ${resource.title}
- Author: ${resource.author}
- Subject: ${resource.subject}
- Type: ${resource.type}
- Difficulty: ${resource.difficulty}
- Description: ${resource.description.slice(0, 500)}${resource.description.length > 500 ? "..." : ""}`
      }
    }

    // Store user message
    await db.tutorMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message.trim(),
      },
    })

    // Build messages for NVIDIA API
    // System prompt combines the base prompt with resource context if available
    const systemPrompt = TUTOR_SYSTEM_PROMPT + resourceContext

    // Build conversation history for context
    const conversationMessages: ChatMessage[] = conversation.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

    // Add the new user message
    conversationMessages.push({
      role: "user",
      content: message.trim(),
    })

    // Get AI response from NVIDIA API
    const client = getNVIDIAClient()
    
    const completion = await client.createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationMessages,
      ],
      temperature: 0.7,
      maxTokens: 2048,
    })

    const aiResponse = completion.choices[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again."

    // Store AI response
    const assistantMessage = await db.tutorMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse,
      },
    })

    // Update conversation timestamp
    await db.tutorConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      message: assistantMessage,
      conversationId: conversation.id,
    })
  } catch (error) {
    console.error("Error in tutor POST:", error)
    
    // Provide more specific error messages
    let errorMessage = "Internal server error"
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "AI service configuration error. Please contact support."
      } else if (error.message.includes("rate limit") || error.message.includes("429")) {
        errorMessage = "AI service is busy. Please try again in a moment."
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again."
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// ============================================
// DELETE - Clear conversation
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 })
    }

    // Verify ownership and delete
    const conversation = await db.tutorConversation.findFirst({
      where: { id: conversationId, userId: user.id },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Delete all messages first (cascade should handle this, but being explicit)
    await db.tutorMessage.deleteMany({
      where: { conversationId },
    })

    // Delete the conversation
    await db.tutorConversation.delete({
      where: { id: conversationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in tutor DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
