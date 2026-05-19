export type Provider = 'openai' | 'anthropic' | 'qwen' | 'deepseek'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  model: string
  stream?: boolean
}

export interface ChatResponse {
  content: string
  usage: { promptTokens: number; completionTokens: number }
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: (fullText: string) => void
  onError: (error: Error) => void
}

export interface ModelAdapter {
  readonly provider: Provider
  chat(request: ChatRequest, apiKey: string, baseUrl?: string): Promise<ChatResponse>
  chatStream(
    request: ChatRequest,
    apiKey: string,
    baseUrl: string | undefined,
    callbacks: StreamCallbacks
  ): Promise<void>
  testConnection(apiKey: string, baseUrl?: string): Promise<boolean>
}
