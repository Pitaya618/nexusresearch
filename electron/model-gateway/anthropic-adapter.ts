import { BaseModelAdapter } from './base-adapter'
import type { ChatRequest, ChatResponse, StreamCallbacks } from './types'

const DEFAULT_BASE_URL = 'https://api.anthropic.com/v1'

export class AnthropicAdapter extends BaseModelAdapter {
  readonly provider = 'anthropic' as const

  getDefaultModel(): string {
    return 'claude-sonnet-4-20250514'
  }

  getAvailableModels(): string[] {
    return ['claude-sonnet-4-20250514', 'claude-haiku-4-20250414']
  }

  protected async doChat(
    request: ChatRequest,
    apiKey: string,
    baseUrl?: string
  ): Promise<ChatResponse> {
    const url = `${baseUrl ?? DEFAULT_BASE_URL}/messages`
    const { system, userMessages } = this.extractSystemMessage(request.messages)

    const body: Record<string, unknown> = {
      model: request.model,
      max_tokens: 4096,
      messages: userMessages,
    }
    if (system) {
      body.system = system
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(apiKey),
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      throw new Error(`Anthropic API error ${resp.status}: ${errText}`)
    }

    const data = await resp.json() as {
      content: Array<{ type: string; text: string }>
      usage: { input_tokens: number; output_tokens: number }
    }

    const text = data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')

    return {
      content: text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
      },
    }
  }

  protected async doChatStream(
    request: ChatRequest,
    apiKey: string,
    baseUrl: string | undefined,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const url = `${baseUrl ?? DEFAULT_BASE_URL}/messages`
    const { system, userMessages } = this.extractSystemMessage(request.messages)

    const body: Record<string, unknown> = {
      model: request.model,
      max_tokens: 4096,
      messages: userMessages,
      stream: true,
    }
    if (system) {
      body.system = system
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(apiKey),
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      callbacks.onError(new Error(`Anthropic API error ${resp.status}: ${errText}`))
      return
    }

    const reader = resp.body?.getReader()
    if (!reader) {
      callbacks.onError(new Error('Response body is not readable'))
      return
    }

    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const event = JSON.parse(data)
            if (event.type === 'content_block_delta') {
              const text = event.delta?.text
              if (text) {
                fullText += text
                callbacks.onToken(text)
              }
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }

      callbacks.onDone(fullText)
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error(String(err)))
    }
  }

  private buildHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }
  }

  private extractSystemMessage(messages: ChatRequest['messages']): {
    system: string | undefined
    userMessages: Array<{ role: 'user' | 'assistant'; content: string }>
  } {
    let system: string | undefined
    const userMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []

    for (const msg of messages) {
      if (msg.role === 'system') {
        system = msg.content
      } else {
        userMessages.push({ role: msg.role, content: msg.content })
      }
    }

    return { system, userMessages }
  }
}
