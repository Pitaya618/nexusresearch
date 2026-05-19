import { Provider, ChatRequest, ChatResponse, StreamCallbacks } from './types'
import { ModelAdapter } from './types'
import { OpenAIAdapter } from './openai-adapter'
import { AnthropicAdapter } from './anthropic-adapter'
import { QwenAdapter } from './qwen-adapter'
import { DeepSeekAdapter } from './deepseek-adapter'

const adapters: Record<Provider, ModelAdapter> = {
  openai: new OpenAIAdapter(),
  anthropic: new AnthropicAdapter(),
  qwen: new QwenAdapter(),
  deepseek: new DeepSeekAdapter()
}

export function getAdapter(provider: Provider): ModelAdapter {
  const adapter = adapters[provider]
  if (!adapter) throw new Error(`Unknown provider: ${provider}`)
  return adapter
}

export async function chat(
  provider: Provider,
  apiKey: string,
  request: ChatRequest,
  baseUrl?: string
): Promise<ChatResponse> {
  return getAdapter(provider).chat(request, apiKey, baseUrl)
}

export async function chatStream(
  provider: Provider,
  apiKey: string,
  request: ChatRequest,
  callbacks: StreamCallbacks,
  baseUrl?: string
): Promise<void> {
  return getAdapter(provider).chatStream(request, apiKey, baseUrl, callbacks)
}

export async function testConnection(
  provider: Provider,
  apiKey: string,
  baseUrl?: string
): Promise<boolean> {
  return getAdapter(provider).testConnection(apiKey, baseUrl)
}

export function getAvailableProviders(): Provider[] {
  return Object.keys(adapters) as Provider[]
}
