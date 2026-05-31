/**
 * NVIDIA AI Client for StudyLens
 *
 * This module provides a client for NVIDIA's AI API (build.nvidia.com)
 * with multi-model fallback support for high availability.
 *
 * Features:
 * - Multi-model fallback (default → fallback 1 → fallback 2)
 * - OpenAI-compatible API format
 * - Bearer token authentication
 * - Conversation context support
 * - Error handling with retries and model fallback
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
// MODEL CONFIGURATION
// ============================================

interface ModelConfig {
  id: string
  displayName: string
  isDefault: boolean
}

const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "mistralai/mistral-large-3-675b-instruct-2512",
    displayName: "Mistral Large 3 (675B)",
    isDefault: true,
  },
  {
    id: "meta/llama-4-maverick-17b-128e-instruct",
    displayName: "Llama 4 Maverick",
    isDefault: false,
  },
  {
    id: "meta/llama-3.3-70b-instruct",
    displayName: "Llama 3.3 70B",
    isDefault: false,
  },
]

const NVIDIA_CONFIG = {
  baseUrl: "https://integrate.api.nvidia.com/v1",
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
  defaultTopP: 0.9,
  maxRetriesPerModel: 2,
  retryDelayMs: 1000,
} as const

// ============================================
// NVIDIA AI CLIENT CLASS
// ============================================

export class NVIDIAIClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NVIDIA_API_KEY || ""
    this.baseUrl = NVIDIA_CONFIG.baseUrl

    if (!this.apiKey) {
      throw new Error("NVIDIA API key is required. Set NVIDIA_API_KEY environment variable.")
    }
  }

  /**
   * Create a chat completion with automatic model fallback
   *
   * Tries models in order: default → fallback 1 → fallback 2
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

    // Try each model in order (default first, then fallbacks)
    const modelsToTry = this.getModelsInPriorityOrder()
    let lastError: NVIDIAAIError | null = null

    for (const modelConfig of modelsToTry) {
      try {
        console.log(`[NVIDIA AI] Trying model: ${modelConfig.displayName} (${modelConfig.id})`)

        const payload = {
          model: modelConfig.id,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          stream,
        }

        const response = await this.makeRequestWithRetry(payload, modelConfig)

        console.log(`[NVIDIA AI] Success with model: ${modelConfig.displayName}`)
        return response
      } catch (error) {
        const nvidiaError = this.isNVIDIAError(error)
          ? error
          : this.createError(error instanceof Error ? error.message : "Unknown error", true)

        console.warn(
          `[NVIDIA AI] Model ${modelConfig.displayName} failed: ${nvidiaError.message}`
        )
        lastError = nvidiaError

        // Continue to next model
        continue
      }
    }

    // All models failed
    const errorMessage = lastError
      ? `All models failed. Last error: ${lastError.message}`
      : "All models failed to respond"

    throw this.createError(errorMessage, false)
  }

  /**
   * Get models ordered by priority (default first, then fallbacks)
   */
  private getModelsInPriorityOrder(): ModelConfig[] {
    const defaultModel = AVAILABLE_MODELS.find((m) => m.isDefault)
    const fallbacks = AVAILABLE_MODELS.filter((m) => !m.isDefault)

    if (!defaultModel) {
      // Fallback: use first available if no default marked
      return [...AVAILABLE_MODELS]
    }

    return [defaultModel, ...fallbacks]
  }

  /**
   * Make API request with exponential backoff retry for a specific model
   */
  private async makeRequestWithRetry(
    payload: Record<string, unknown>,
    modelConfig: ModelConfig,
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

        if (isRetryable && attempt < NVIDIA_CONFIG.maxRetriesPerModel) {
          const delay = NVIDIA_CONFIG.retryDelayMs * attempt
          console.warn(
            `[NVIDIA AI] Retry ${attempt}/${NVIDIA_CONFIG.maxRetriesPerModel} for ${modelConfig.displayName} after ${delay}ms`
          )
          await this.sleep(delay)
          return this.makeRequestWithRetry(payload, modelConfig, attempt + 1)
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

      if (isRetryable && attempt < NVIDIA_CONFIG.maxRetriesPerModel) {
        const delay = NVIDIA_CONFIG.retryDelayMs * attempt
        console.warn(
          `[NVIDIA AI] Retry ${attempt}/${NVIDIA_CONFIG.maxRetriesPerModel} for ${modelConfig.displayName} after ${delay}ms`
        )
        await this.sleep(delay)
        return this.makeRequestWithRetry(payload, modelConfig, attempt + 1)
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
   * Get the default model name
   */
  getDefaultModel(): string {
    const defaultModel = AVAILABLE_MODELS.find((m) => m.isDefault)
    return defaultModel?.id || AVAILABLE_MODELS[0]?.id || ""
  }

  /**
   * Get the default model display name
   */
  getDefaultModelDisplayName(): string {
    const defaultModel = AVAILABLE_MODELS.find((m) => m.isDefault)
    return defaultModel?.displayName || "Unknown"
  }

  /**
   * Get all available models
   */
  getAvailableModels(): ModelConfig[] {
    return [...AVAILABLE_MODELS]
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
