import { describe, it, expect } from 'vitest'
import { OpenAIAdapter } from '../../electron/model-gateway/openai-adapter'

describe('OpenAIAdapter', () => {
  const adapter = new OpenAIAdapter()

  it('provider should be "openai"', () => {
    expect(adapter.provider).toBe('openai')
  })

  it('default model should be "gpt-4o"', () => {
    expect(adapter.getDefaultModel()).toBe('gpt-4o')
  })

  it('available models should include gpt-4o and gpt-4o-mini', () => {
    const models = adapter.getAvailableModels()
    expect(models).toContain('gpt-4o')
    expect(models).toContain('gpt-4o-mini')
  })

  it('should throw when apiKey is empty', async () => {
    await expect(
      adapter.chat({ messages: [{ role: 'user', content: 'Hi' }], model: 'gpt-4o' }, '')
    ).rejects.toThrow('API key is required')
  })

  it('chatStream should throw when apiKey is empty', async () => {
    await expect(
      adapter.chatStream(
        { messages: [{ role: 'user', content: 'Hi' }], model: 'gpt-4o' },
        '',
        undefined,
        { onToken: () => {}, onDone: () => {}, onError: () => {} }
      )
    ).rejects.toThrow('API key is required')
  })
})
