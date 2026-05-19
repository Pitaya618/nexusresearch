import { BaseModelAdapter } from './base-adapter'
import type { ChatRequest, ChatResponse, StreamCallbacks } from './types'

const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

export class QwenAdapter extends BaseModelAdapter {
  readonly provider = 'qwen' as const

  getDefaultModel(): string {
    return 'qwen-max'
  }

  getAvailableModels(): string[] {
    return ['qwen-max', 'qwen-plus', 'qwen-turbo']
  }

  protected async doChat(
    request: ChatRequest,
    apiKey: string,
    baseUrl?: string
  ): Promise<ChatResponse> {
    const url = `${baseUrl ?? DEFAULT_BASE_URL}/chat/completions`

    const resp = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(apiKey),
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      throw new Error(`Qwen API error ${resp.status}: ${errText}`)
    }

    const data = await resp.json() as {
      choices: Array<{ message: { content: string } }>
      usage: { prompt_tokens: number; completion_tokens: number }
    }

    return {
      content: data.choices[0]?.message?.content ?? '',
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
      },
    }
  }

  protected async doChatStream(
    request: ChatRequest,
    apiKey: string,
    baseUrl: string | undefined,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const url = `${baseUrl ?? DEFAULT_BASE_URL}/chat/completions`

    const resp = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(apiKey),
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: true,
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      callbacks.onError(new Error(`Qwen API error ${resp.status}: ${errText}`))
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
            const parsed = JSON.parse(data) as {
              choices: Array<{ delta: { content?: string } }>
            }
            const token = parsed.choices[0]?.delta?.content
            if (token) {
              fullText += token
              callbacks.onToken(token)
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
      Authorization: `Bearer ${apiKey}`,
    }
  }
}
