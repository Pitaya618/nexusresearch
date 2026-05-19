import type {
  Provider,
  ChatRequest,
  ChatResponse,
  StreamCallbacks,
  ModelAdapter,
} from './types'

export abstract class BaseModelAdapter implements ModelAdapter {
  abstract readonly provider: Provider

  async chat(request: ChatRequest, apiKey: string, baseUrl?: string): Promise<ChatResponse> {
    if (!apiKey) {
      throw new Error(`${this.provider} API key is required`)
    }
    return this.doChat(request, apiKey, baseUrl)
  }

  async chatStream(
    request: ChatRequest,
    apiKey: string,
    baseUrl: string | undefined,
    callbacks: StreamCallbacks
  ): Promise<void> {
    if (!apiKey) {
      throw new Error(`${this.provider} API key is required`)
    }
    return this.doChatStream(request, apiKey, baseUrl, callbacks)
  }

  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    if (!apiKey) {
      return false
    }
    try {
      const model = this.getDefaultModel()
      await this.doChat(
        {
          messages: [{ role: 'user', content: 'Hi' }],
          model,
        },
        apiKey,
        baseUrl
      )
      return true
    } catch {
      return false
    }
  }

  protected abstract doChat(
    request: ChatRequest,
    apiKey: string,
    baseUrl?: string
  ): Promise<ChatResponse>

  protected abstract doChatStream(
    request: ChatRequest,
    apiKey: string,
    baseUrl: string | undefined,
    callbacks: StreamCallbacks
  ): Promise<void>

  abstract getDefaultModel(): string
  abstract getAvailableModels(): string[]
}
