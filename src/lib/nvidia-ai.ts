/**
 * NVIDIA AI Client for StudyLens
 * 
 * This module provides a client for NVIDIA's AI API (build.nvidia.com)
 * using the meta/llama-3.1-405b-instruct model.
 * 
 * Features:
 * - OpenAI-compatible API format
 * - Bearer token authentication
 * - Conversation context support
 * - Error handling with retries
 * - User isolation (each user has separate conversations)
 */

// ============================================
// TYPES
// ============================================

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ChatCompletionOptions {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  topP?: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface NVIDIAAIError {
  message: string
  statusCode?: number
  retryable: boolean
}

// ============================================
// CONFIGURATION
// ============================================

const NVIDIA_CONFIG = {
  baseUrl: "https://integrate.api.nvidia.com/v1",
  model: "meta/llama-3.1-405b-instruct",
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
  defaultTopP: 0.9,
  maxRetries: 3,
  retryDelayMs: 1000,
} as const

// ============================================
// NVIDIA AI CLIENT CLASS
// ============================================

export class NVIDIAIClient {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NVIDIA_API_KEY || ""
    this.baseUrl = NVIDIA_CONFIG.baseUrl
    this.model = NVIDIA_CONFIG.model

    if (!this.apiKey) {
      throw new Error("NVIDIA API key is required. Set NVIDIA_API_KEY environment variable.")
    }
  }

  /**
   * Create a chat completion with the NVIDIA API
   * 
   * @param options - Chat completion options including messages
   * @returns Chat completion response
   */
  async createChatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const {
      messages,
      temperature = NVIDIA_CONFIG.defaultTemperature,
      maxTokens = NVIDIA_CONFIG.defaultMaxTokens,
      topP = NVIDIA_CONFIG.defaultTopP,
      stream = false,
    } = options

    // Validate messages
    if (!messages || messages.length === 0) {
      throw this.createError("Messages array cannot be empty", false)
    }

    // Prepare the request payload
    const payload = {
      model: this.model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream,
    }

    // Make the API request with retries
    return this.makeRequestWithRetry(payload)
  }

  /**
   * Make API request with exponential backoff retry
   */
  private async makeRequestWithRetry(
    payload: Record<string, unknown>,
    attempt = 1
  ): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      // Handle non-OK responses
      if (!response.ok) {
        const errorBody = await response.text()
        let errorMessage = `NVIDIA API error: ${response.status}`

        try {
          const errorJson = JSON.parse(errorBody)
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        } catch {
          // Use default error message
        }

        // Check if retryable (5xx errors or rate limits)
        const isRetryable = response.status >= 500 || response.status === 429

        if (isRetryable && attempt < NVIDIA_CONFIG.maxRetries) {
          const delay = NVIDIA_CONFIG.retryDelayMs * attempt
          console.warn(`NVIDIA API retry ${attempt}/${NVIDIA_CONFIG.maxRetries} after ${delay}ms`)
          await this.sleep(delay)
          return this.makeRequestWithRetry(payload, attempt + 1)
        }

        throw this.createError(errorMessage, isRetryable, response.status)
      }

      // Parse successful response
      const data = (await response.json()) as ChatCompletionResponse
      return data
    } catch (error) {
      // If it's already our error type, re-throw
      if (this.isNVIDIAError(error)) {
        throw error
      }

      // Network or other errors
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const isRetryable = !errorMessage.includes("API key")

      if (isRetryable && attempt < NVIDIA_CONFIG.maxRetries) {
        const delay = NVIDIA_CONFIG.retryDelayMs * attempt
        console.warn(`NVIDIA API retry ${attempt}/${NVIDIA_CONFIG.maxRetries} after ${delay}ms`)
        await this.sleep(delay)
        return this.makeRequestWithRetry(payload, attempt + 1)
      }

      throw this.createError(errorMessage, isRetryable)
    }
  }

  /**
   * Helper to create consistent error objects
   */
  private createError(message: string, retryable: boolean, statusCode?: number): NVIDIAAIError {
    return {
      message,
      statusCode,
      retryable,
    }
  }

  /**
   * Type guard for NVIDIA error
   */
  private isNVIDIAError(error: unknown): error is NVIDIAAIError {
    return (
      typeof error === "object" &&
      error !== null &&
      "retryable" in error &&
      "message" in error
    )
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get the model name
   */
  getModel(): string {
    return this.model
  }

  /**
   * Get the model display name
   */
  getModelDisplayName(): string {
    return "Llama 3.1 405B"
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let nvidiaClientInstance: NVIDIAIClient | null = null

/**
 * Get or create the NVIDIA AI client singleton
 */
export function getNVIDIAClient(): NVIDIAIClient {
  if (!nvidiaClientInstance) {
    nvidiaClientInstance = new NVIDIAIClient()
  }
  return nvidiaClientInstance
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetNVIDIAClient(): void {
  nvidiaClientInstance = null
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Simple chat completion helper
 * 
 * @param systemPrompt - System prompt for the AI
 * @param userMessage - User's message
 * @param conversationHistory - Previous messages for context
 * @returns AI response text
 */
export async function chatWithNVIDIA(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const client = getNVIDIAClient()

  // Build messages array
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ]

  const response = await client.createChatCompletion({ messages })

  return response.choices[0]?.message?.content || ""
}

/**
 * Chat completion with full conversation context
 * 
 * @param systemPrompt - System prompt for the AI
 * @param messages - Full message history including new user message
 * @returns AI response text
 */
export async function chatWithContext(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const client = getNVIDIAClient()

  // Prepend system prompt
  const fullMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ]

  const response = await client.createChatCompletion({ messages: fullMessages })

  return response.choices[0]?.message?.content || ""
}
