import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

export interface CompileResult {
  success: boolean
  log: string
  pdfPath?: string
  errors: CompileError[]
}

export interface CompileError {
  line: number
  message: string
  type: 'error' | 'warning'
}

export function compileLatex(projectPath: string, mainFile: string = 'main.tex'): Promise<CompileResult> {
  return new Promise((resolve) => {
    const texPath = path.join(projectPath, mainFile)
    const outputDir = path.join(projectPath, 'output')
    fs.mkdirSync(outputDir, { recursive: true })

    const cmd = `latexmk -pdf -interaction=nonstopmode -output-directory="${outputDir}" "${texPath}"`

    exec(cmd, { cwd: projectPath, timeout: 60000 }, (error, stdout, stderr) => {
      const log = (stdout + stderr).toString()
      const errors = parseLog(log)
      const pdfPath = path.join(outputDir, mainFile.replace('.tex', '.pdf'))

      resolve({
        success: !error || errors.filter(e => e.type === 'error').length === 0,
        log,
        pdfPath: fs.existsSync(pdfPath) ? pdfPath : undefined,
        errors
      })
    })
  })
}

function parseLog(log: string): CompileError[] {
  const errors: CompileError[] = []
  const lines = log.split('\n')

  for (const line of lines) {
    const errorMatch = line.match(/^!(.*\.).*$/)
    if (errorMatch) {
      errors.push({ line: 0, message: line, type: 'error' })
      continue
    }

    const warnMatch = line.match(/^Warning/)
    if (warnMatch) {
      errors.push({ line: 0, message: line, type: 'warning' })
    }
  }

  return errors
}

export function readPdfBytes(pdfPath: string): Buffer | null {
  if (!fs.existsSync(pdfPath)) return null
  return fs.readFileSync(pdfPath)
}
