import { ipcMain, app } from 'electron'
import { v4 as uuid } from 'uuid'
import { getDb } from './db/connection'
import { ModelConfigRepository } from './db/repositories/model-config-repo'
import { LiteratureRepository } from './db/repositories/literature-repo'
import { TagRepository } from './db/repositories/tag-repo'
import { CollectionRepository } from './db/repositories/collection-repo'
import { AnnotationRepository } from './db/repositories/annotation-repo'
import { ReadingNoteRepository } from './db/repositories/reading-note-repo'
import { ScratchpadRepository } from './db/repositories/scratchpad-repo'
import { PaperRepository } from './db/repositories/paper-repo'
import { extractPdfMetadata, computePdfHash } from './services/pdf-metadata'
import { generateApa, generateMla, generateGbT7714 } from './services/citation'
import { compileLatex } from './services/latex-compile'
import * as gateway from './model-gateway/gateway'
import fs from 'fs'
import path from 'path'

export function registerIpcHandlers(): void {
  const db = getDb()
  const modelConfigRepo = new ModelConfigRepository(db)

  // ============ 模型网关 ============
  ipcMain.handle('model-config:list', () => {
    return modelConfigRepo.findAll()
  })

  ipcMain.handle('model-config:create', (_e, input: { provider: string; apiKey: string; baseUrl: string }) => {
    return modelConfigRepo.create(input as any)
  })

  ipcMain.handle('model-config:update', (_e, id: string, data: Record<string, unknown>) => {
    modelConfigRepo.update(id, data as any)
    return modelConfigRepo.findById(id)
  })

  ipcMain.handle('model-config:delete', (_e, id: string) => {
    modelConfigRepo.delete(id)
    return { success: true }
  })

  ipcMain.handle('model-gateway:test', async (_e, provider: string, apiKey: string, baseUrl?: string) => {
    return gateway.testConnection(provider as any, apiKey, baseUrl)
  })

  ipcMain.handle('model-gateway:chat', async (_e, provider: string, apiKey: string, request: any, baseUrl?: string) => {
    return gateway.chat(provider as any, apiKey, request, baseUrl)
  })

  ipcMain.handle('model-gateway:providers', () => {
    return gateway.getAvailableProviders()
  })

  // ============ Literature ============
  const literatureRepo = new LiteratureRepository(db)
  const tagRepo = new TagRepository(db)
  const collectionRepo = new CollectionRepository(db)
  collectionRepo.initDefaults()

  ipcMain.handle('literature:list', () => literatureRepo.findAll())

  ipcMain.handle('literature:search', (_e, query: string) => literatureRepo.search(query))

  ipcMain.handle('literature:get', (_e, id: string) => literatureRepo.findById(id))

  ipcMain.handle('literature:import', async (_e, filePaths: string[]) => {
    const results = []
    const dataDir = path.join(app.getPath('home'), '.nexusresearch', 'data', 'literature')
    fs.mkdirSync(dataDir, { recursive: true })

    for (const filePath of filePaths) {
      const buffer = fs.readFileSync(filePath)
      const pdfHash = computePdfHash(buffer)

      const existing = literatureRepo.findByHash(pdfHash)
      if (existing) {
        results.push({ id: existing.id, status: 'duplicate' })
        continue
      }

      const meta = await extractPdfMetadata(buffer)

      const filename = `${pdfHash}.pdf`
      const destPath = path.join(dataDir, filename)
      fs.copyFileSync(filePath, destPath)

      const lit = literatureRepo.create({
        title: meta.title || path.basename(filePath, '.pdf'),
        authors: meta.authors,
        journal: meta.journal,
        year: meta.year,
        doi: meta.doi,
        abstract: meta.abstract,
        keywords: meta.keywords,
        pdfPath: destPath,
        pdfHash
      })

      literatureRepo.update(lit.id, {
        citationFormats: {
          apa: generateApa(meta),
          mla: generateMla(meta),
          gb_t_7714: generateGbT7714(meta)
        }
      })

      results.push({ id: lit.id, status: 'imported' })
    }

    return results
  })

  ipcMain.handle('literature:update', (_e, id: string, data: Record<string, unknown>) => {
    literatureRepo.update(id, data as any)
    return literatureRepo.findById(id)
  })

  ipcMain.handle('literature:delete', (_e, id: string) => {
    literatureRepo.delete(id)
    return { success: true }
  })

  ipcMain.handle('literature:generate-summary', async (_e, literatureId: string) => {
    const lit = literatureRepo.findById(literatureId)
    if (!lit) throw new Error('Literature not found')

    const pdfBuffer = fs.readFileSync(lit.pdfPath)
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) }).promise

    let fullText = ''
    for (let i = 1; i <= Math.min(doc.numPages, 20); i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      fullText += content.items.map((item: any) => item.str).join(' ') + '\n'
    }

    const context = fullText.slice(0, 8000)

    const binding = db.prepare('SELECT * FROM module_model_binding WHERE module = ?').get('literature') as any
    if (!binding) throw new Error('No model configured for literature module. Please set up in Settings.')

    const config = modelConfigRepo.findById(binding.model_config_id)
    if (!config) throw new Error('Model configuration not found')

    const prompt = `You are an academic research assistant. Given the following paper content, generate a structured summary with: Purpose, Methods, Results, and Conclusion. Output in the same language as the paper.

Paper content:
${context}`

    const response = await gateway.chat(
      config.provider as any,
      config.apiKey,
      { messages: [{ role: 'user', content: prompt }], model: binding.model_name },
      config.baseUrl || undefined
    )

    literatureRepo.update(literatureId, { aiSummary: response.content })
    return literatureRepo.findById(literatureId)
  })

  // ============ Tags ============
  ipcMain.handle('tag:list', () => tagRepo.findAll())
  ipcMain.handle('tag:create', (_e, name: string, color?: string) => tagRepo.create(name, color))
  ipcMain.handle('tag:delete', (_e, id: string) => { tagRepo.delete(id); return { success: true } })

  // ============ Collections ============
  ipcMain.handle('collection:list', () => collectionRepo.findAll())
  ipcMain.handle('collection:create', (_e, name: string) => collectionRepo.create(name))
  ipcMain.handle('collection:delete', (_e, id: string) => { collectionRepo.delete(id); return { success: true } })

  // ============ Reading ============
  const annotationRepo = new AnnotationRepository(db)
  const readingNoteRepo = new ReadingNoteRepository(db)

  ipcMain.handle('annotation:list', (_e, literatureId: string) => {
    return annotationRepo.findByLiterature(literatureId)
  })

  ipcMain.handle('annotation:create', (_e, input: any) => {
    return annotationRepo.create(input)
  })

  ipcMain.handle('annotation:delete', (_e, id: string) => {
    annotationRepo.delete(id)
    return { success: true }
  })

  ipcMain.handle('reading-note:get', (_e, literatureId: string) => {
    return readingNoteRepo.findOrCreate(literatureId)
  })

  ipcMain.handle('reading-note:update', (_e, literatureId: string, content: string) => {
    return readingNoteRepo.update(literatureId, content)
  })

  ipcMain.handle('reading:ai-qa', async (_e, literatureId: string, question: string) => {
    const lit = literatureRepo.findById(literatureId)
    if (!lit) throw new Error('Literature not found')

    const pdfBuffer = fs.readFileSync(lit.pdfPath)
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) }).promise
    let fullText = ''
    for (let i = 1; i <= Math.min(doc.numPages, 30); i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      fullText += content.items.map((item: any) => item.str).join(' ') + '\n'
    }
    const context = fullText.slice(0, 12000)

    const binding = db.prepare('SELECT * FROM module_model_binding WHERE module = ?').get('reading') as any
    if (!binding) throw new Error('No model configured for reading module')

    const config = modelConfigRepo.findById(binding.model_config_id)
    if (!config) throw new Error('Model configuration not found')

    const prompt = `You are an academic research assistant. Based on the following paper, answer the user's question accurately and concisely. Cite specific sections when possible.

Paper content:
${context}

User question: ${question}`

    const response = await gateway.chat(
      config.provider as any,
      config.apiKey,
      { messages: [{ role: 'user', content: prompt }], model: binding.model_name },
      config.baseUrl || undefined
    )

    return response.content
  })

  ipcMain.handle('reading:chapter-summary', async (_e, literatureId: string, chapterText: string) => {
    const binding = db.prepare('SELECT * FROM module_model_binding WHERE module = ?').get('reading') as any
    if (!binding) throw new Error('No model configured for reading module')

    const config = modelConfigRepo.findById(binding.model_config_id)
    if (!config) throw new Error('Model configuration not found')

    const prompt = `Generate a structured summary of the following academic text section. Include key points, methods, and findings.

Section text:
${chapterText}`

    const response = await gateway.chat(
      config.provider as any,
      config.apiKey,
      { messages: [{ role: 'user', content: prompt }], model: binding.model_name },
      config.baseUrl || undefined
    )

    return response.content
  })

  // ============ Scratchpad ============
  const scratchpadRepo = new ScratchpadRepository(db)

  ipcMain.handle('scratchpad:list', () => scratchpadRepo.findAll())

  ipcMain.handle('scratchpad:get', (_e, id: string) => scratchpadRepo.findById(id))

  ipcMain.handle('scratchpad:create', (_e, title?: string) => scratchpadRepo.create(title))

  ipcMain.handle('scratchpad:update', (_e, id: string, data: any) => {
    scratchpadRepo.update(id, data)
    return scratchpadRepo.findById(id)
  })

  ipcMain.handle('scratchpad:delete', (_e, id: string) => {
    scratchpadRepo.delete(id)
    return { success: true }
  })

  ipcMain.handle('scratchpad:ai-chat', async (_e, content: string, chatHistory: any[], question: string) => {
    const binding = db.prepare('SELECT * FROM module_model_binding WHERE module = ?').get('scratchpad') as any
    if (!binding) throw new Error('No model configured for scratchpad module')

    const config = modelConfigRepo.findById(binding.model_config_id)
    if (!config) throw new Error('Model configuration not found')

    const messages = [
      {
        role: 'system',
        content: `You are a research assistant helping a researcher develop their ideas. The researcher has the following notes:\n\n${content.slice(0, 8000)}\n\nHelp them think through their ideas, suggest improvements, and ask clarifying questions.`
      },
      ...chatHistory.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: question }
    ]

    const response = await gateway.chat(
      config.provider as any,
      config.apiKey,
      { messages, model: binding.model_name },
      config.baseUrl || undefined
    )

    return response.content
  })

  ipcMain.handle('scratchpad:ai-edit', async (_e, content: string, instruction: string) => {
    const binding = db.prepare('SELECT * FROM module_model_binding WHERE module = ?').get('scratchpad') as any
    if (!binding) throw new Error('No model configured for scratchpad module')

    const config = modelConfigRepo.findById(binding.model_config_id)
    if (!config) throw new Error('Model configuration not found')

    const prompt = `You are editing a research scratchpad. The current content is:

${content}

User instruction: ${instruction}

Return the edited content. Output ONLY the new content, nothing else.`

    const response = await gateway.chat(
      config.provider as any,
      config.apiKey,
      { messages: [{ role: 'user', content: prompt }], model: binding.model_name },
      config.baseUrl || undefined
    )

    return response.content
  })

  // ============ Paper ============
  const paperRepo = new PaperRepository(db)

  ipcMain.handle('paper:list', () => paperRepo.findAll())

  ipcMain.handle('paper:get', (_e, id: string) => paperRepo.findById(id))

  ipcMain.handle('paper:create', async (_e, input: { title: string; targetJournal: string; template?: string }) => {
    const id = uuid()
    const projectPath = path.join(app.getPath('home'), '.nexusresearch', 'data', 'papers', `paper-${id}`)
    fs.mkdirSync(projectPath, { recursive: true })

    const template = input.template || 'general'
    initLatexProject(projectPath, template)

    return paperRepo.create({ ...input, projectPath })
  })

  ipcMain.handle('paper:update', (_e, id: string, data: any) => {
    paperRepo.update(id, data)
    return paperRepo.findById(id)
  })

  ipcMain.handle('paper:delete', (_e, id: string) => {
    const paper = paperRepo.findById(id)
    if (paper?.projectPath && fs.existsSync(paper.projectPath)) {
      fs.rmSync(paper.projectPath, { recursive: true, force: true })
    }
    paperRepo.delete(id)
    return { success: true }
  })

  ipcMain.handle('paper:compile', async (_e, paperId: string) => {
    const paper = paperRepo.findById(paperId)
    if (!paper) throw new Error('Paper not found')
    return compileLatex(paper.projectPath, paper.mainFile)
  })

  ipcMain.handle('paper:read-file', (_e, paperId: string, filename: string) => {
    const paper = paperRepo.findById(paperId)
    if (!paper) throw new Error('Paper not found')
    const filePath = path.join(paper.projectPath, filename)
    return fs.readFileSync(filePath, 'utf-8')
  })

  ipcMain.handle('paper:write-file', (_e, paperId: string, filename: string, content: string) => {
    const paper = paperRepo.findById(paperId)
    if (!paper) throw new Error('Paper not found')
    const filePath = path.join(paper.projectPath, filename)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  })

  ipcMain.handle('paper:list-files', (_e, paperId: string) => {
    const paper = paperRepo.findById(paperId)
    if (!paper) throw new Error('Paper not found')
    return listFilesRecursive(paper.projectPath, '')
  })

  ipcMain.handle('paper:ai-polish', async (_e, paperId: string, text: string, mode: string) => {
    const binding = db.prepare('SELECT * FROM module_model_binding WHERE module = ?').get('writing') as any
    if (!binding) throw new Error('No model configured for writing module')

    const config = modelConfigRepo.findById(binding.model_config_id)
    if (!config) throw new Error('Model configuration not found')

    const modePrompts: Record<string, string> = {
      academic: 'Rewrite this text in formal academic style, improving precision and formality. Keep the LaTeX format intact.',
      concise: 'Rewrite this text to be more concise, removing redundancy while preserving meaning. Keep LaTeX format.',
      expand: 'Expand this text with more detail and explanation. Keep LaTeX format.',
      preserve: 'Improve the expression quality while preserving the exact meaning. Keep LaTeX format.'
    }

    const prompt = `${modePrompts[mode] || modePrompts.academic}\n\nText:\n${text}`

    const response = await gateway.chat(
      config.provider as any,
      config.apiKey,
      { messages: [{ role: 'user', content: prompt }], model: binding.model_name },
      config.baseUrl || undefined
    )

    return response.content
  })

  // Helper: Initialize LaTeX project
  function initLatexProject(projectPath: string, template: string) {
    const sectionsDir = path.join(projectPath, 'sections')
    const figuresDir = path.join(projectPath, 'figures')
    const styleDir = path.join(projectPath, 'style')
    const outputDir = path.join(projectPath, 'output')

    for (const dir of [sectionsDir, figuresDir, styleDir, outputDir]) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const mainTex = `\\documentclass{article}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{hyperref}
\\usepackage[utf8]{inputenc}

\\title{Your Paper Title}
\\author{Author Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
Your abstract here.
\\end{abstract}

\\input{sections/introduction}
\\input{sections/method}
\\input{sections/experiments}
\\input{sections/conclusion}

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}
`

    fs.writeFileSync(path.join(projectPath, 'main.tex'), mainTex)
    fs.writeFileSync(path.join(projectPath, 'sections/introduction.tex'), '\\section{Introduction}\n\nYour introduction here.')
    fs.writeFileSync(path.join(projectPath, 'sections/method.tex'), '\\section{Method}\n\nYour method here.')
    fs.writeFileSync(path.join(projectPath, 'sections/experiments.tex'), '\\section{Experiments}\n\nYour experiments here.')
    fs.writeFileSync(path.join(projectPath, 'sections/conclusion.tex'), '\\section{Conclusion}\n\nYour conclusion here.')
    fs.writeFileSync(path.join(projectPath, 'references.bib'), '% Add your BibTeX entries here\n')
  }

  function listFilesRecursive(dir: string, prefix: string): string[] {
    const files: string[] = []
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const relPath = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        files.push(...listFilesRecursive(path.join(dir, entry.name), relPath))
      } else {
        files.push(relPath)
      }
    }
    return files
  }
}
