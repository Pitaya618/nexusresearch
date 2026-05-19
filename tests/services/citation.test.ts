import { describe, it, expect } from 'vitest'
import { generateApa, generateMla, generateGbT7714 } from '../../electron/services/citation'

const sampleLit = {
  title: 'Deep Learning for Natural Language Processing',
  authors: ['Zhang Wei', 'Li Ming'],
  journal: 'Journal of AI Research',
  year: 2024,
  doi: '10.1234/jair.2024.001'
}

describe('Citation generators', () => {
  it('generates APA format', () => {
    const result = generateApa(sampleLit)
    expect(result).toContain('Zhang')
    expect(result).toContain('2024')
    expect(result).toContain('Deep Learning')
    expect(result).toContain('10.1234/jair.2024.001')
  })

  it('generates MLA format', () => {
    const result = generateMla(sampleLit)
    expect(result).toContain('Zhang')
    expect(result).toContain('Deep Learning')
    expect(result).toContain('2024')
  })

  it('generates GB/T 7714 format', () => {
    const result = generateGbT7714(sampleLit)
    expect(result).toContain('Zhang')
    expect(result).toContain('2024')
    expect(result).toContain('Deep Learning')
  })

  it('handles single author', () => {
    const single = { ...sampleLit, authors: ['Wang Chen'] }
    const result = generateApa(single)
    expect(result).toContain('Wang')
  })
})
