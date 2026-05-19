export interface CitationInput {
  title: string
  authors: string[]
  journal: string
  year: number
  doi: string
}

function formatAuthorsApa(authors: string[]): string {
  if (authors.length === 0) return 'Unknown'
  if (authors.length === 1) return authors[0]
  if (authors.length <= 20) {
    return authors.slice(0, -1).join(', ') + ', & ' + authors[authors.length - 1]
  }
  return authors.slice(0, 19).join(', ') + ', ... ' + authors[authors.length - 1]
}

function formatAuthorsMla(authors: string[]): string {
  if (authors.length === 0) return 'Unknown'
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return authors[0] + ' and ' + authors[1]
  return authors[0] + ', et al.'
}

export function generateApa(input: CitationInput): string {
  const authors = formatAuthorsApa(input.authors)
  const doi = input.doi ? ` https://doi.org/${input.doi}` : ''
  return `${authors} (${input.year}). ${input.title}. *${input.journal}*${doi}`
}

export function generateMla(input: CitationInput): string {
  const authors = formatAuthorsMla(input.authors)
  return `${authors}. "${input.title}." *${input.journal}*, ${input.year}.`
}

export function generateGbT7714(input: CitationInput): string {
  const authors = input.authors.length > 3
    ? input.authors.slice(0, 3).join(', ') + ', 等'
    : input.authors.join(', ')
  return `${authors}. ${input.title}[J]. ${input.journal}, ${input.year}.`
}
