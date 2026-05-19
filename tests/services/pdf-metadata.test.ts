import { describe, it, expect } from 'vitest'
import { extractPdfMetadata, computePdfHash } from '../../electron/services/pdf-metadata'

describe('extractPdfMetadata', () => {
  it('returns basic info from a valid PDF buffer', async () => {
    // Minimal PDF with metadata
    const pdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
      'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n' +
      'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    )
    const result = await extractPdfMetadata(pdfBuffer)
    expect(result.pageCount).toBeGreaterThan(0)
  })

  it('computes SHA-256 hash', () => {
    const hash = computePdfHash(Buffer.from('test'))
    expect(hash).toHaveLength(64)
  })
})
