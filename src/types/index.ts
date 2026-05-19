// ============ 文献管理 ============
export interface Literature {
  id: string
  title: string
  authors: string[]
  journal: string
  year: number
  doi: string
  abstract: string
  keywords: string[]
  pdfPath: string
  pdfHash: string
  tags: string[]
  collections: string[]
  isImportant: boolean
  isRead: boolean
  aiSummary: string
  aiKeywords: string[]
  citationFormats: {
    apa: string
    mla: string
    gb_t_7714: string
  }
  createdAt: string
  updatedAt: string
}

export interface Collection {
  id: string
  name: string
  isSystem: boolean
  sortOrder: number
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
}

// ============ 文献阅读 ============
export interface ReadingNote {
  id: string
  literatureId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Annotation {
  id: string
  literatureId: string
  page: number
  type: 'highlight' | 'text_note'
  rect: { x: number; y: number; w: number; h: number }
  color: string
  colorLabel: string
  text: string
  note: string
  createdAt: string
}

// ============ 随笔 ============
export interface Scratchpad {
  id: string
  title: string
  content: string
  chatHistory: ChatMessage[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// ============ 论文写作 ============
export interface Paper {
  id: string
  title: string
  targetJournal: string
  projectPath: string
  mainFile: string
  template: string
  citations: PaperCitation[]
  createdAt: string
  updatedAt: string
}

export interface PaperCitation {
  literatureId: string
  citeKey: string
}

// ============ 模型网关 ============
export interface ModelConfig {
  id: string
  provider: Provider
  apiKey: string
  baseUrl: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export type Provider = 'openai' | 'anthropic' | 'qwen' | 'deepseek'

export interface ModuleModelBinding {
  module: string
  modelConfigId: string
  modelName: string
}

export interface ChatRequest {
  provider: Provider
  model: string
  apiKey: string
  baseUrl?: string
  messages: { role: string; content: string }[]
  stream?: boolean
}

export interface ChatResponse {
  content: string
  usage: { promptTokens: number; completionTokens: number }
}

// ============ 渲染进程 API ============
export interface ElectronApi {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  on: (channel: string, callback: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    api: ElectronApi
  }
}
