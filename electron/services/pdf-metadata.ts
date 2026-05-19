import crypto from 'crypto'

export interface PdfMetadata {
  title: string
  authors: string[]
  journal: string
  year: number
  doi: string
  abstract: string
  keywords: string[]
  pageCount: number
}

export async function extractPdfMetadata(buffer: Buffer): Promise<PdfMetadata> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise

  const metadata = await doc.getMetadata()
  const info = (metadata.info || {}) as Record<string, string>

  const title = info.Title || ''
  const authorStr = info.Author || ''
  const authors = authorStr ? authorStr.split(/[,;]\s*/).filter(Boolean) : []
  const doi = extractDoi((info.Subject || '') + ' ' + (info.Keywords || ''))
  const year = extractYear(info.CreationDate || info.ModDate || '')

  return {
    title,
    authors,
    journal: '',
    year,
    doi,
    abstract: info.Subject || '',
    keywords: info.Keywords ? info.Keywords.split(/[,;]\s*/).filter(Boolean) : [],
    pageCount: doc.numPages
  }
}

export function computePdfHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function extractDoi(text: string): string {
  const doiMatch = text.match(/10\.\d{4,}\/[^\s]+/)
  return doiMatch ? doiMatch[0] : ''
}

function extractYear(dateStr: string): number {
  const yearMatch = dateStr.match(/(\d{4})/)
  return yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()
}
