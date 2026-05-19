import type { ChatRequest, ChatResponse, StreamCallbacks, Provider } from './types'
import { BaseModelAdapter } from './base-adapter'

const DEFAULT_BASE_URL = 'https://api.openai.com/v1'

interface OpenAIChatChoice {
  message: { content: string }
  finish_reason: string
}

interface OpenAIChatResponse {
  choices: OpenAIChatChoice[]
  usage: { prompt_tokens: number; completion_tokens: number }
}

export class OpenAIAdapter extends BaseModelAdapter {
  readonly provider: Provider = 'openai'

  getDefaultModel(): string {
    return 'gpt-4o'
  }

  getAvailableModels(): string[] {
    return ['gpt-4o', 'gpt-4o-mini']
  }

  protected async doChat(
    request: ChatRequest,
    apiKey: string,
    baseUrl?: string
  ): Promise<ChatResponse> {
    const url = `${baseUrl || DEFAULT_BASE_URL}/chat/completions`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: false,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`OpenAI API error ${response.status}: ${body}`)
    }

    const data: OpenAIChatResponse = await response.json()
    const choice = data.choices[0]

    if (!choice) {
      throw new Error('OpenAI API returned no choices')
    }

    return {
      content: choice.message.content,
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
    const url = `${baseUrl || DEFAULT_BASE_URL}/chat/completions`

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: true,
        }),
      })
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error(String(err)))
      return
    }

    if (!response.ok) {
      const body = await response.text()
      callbacks.onError(new Error(`OpenAI API error ${response.status}: ${body}`))
      return
    }

    const reader = response.body?.getReader()
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
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue

          const json = trimmed.slice(6)
          try {
            const parsed = JSON.parse(json)
            const delta = parsed.choices?.[0]?.delta
            if (delta?.content) {
              fullText += delta.content
              callbacks.onToken(delta.content)
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      callbacks.onDone(fullText)
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error(String(err)))
    }
  }
}
