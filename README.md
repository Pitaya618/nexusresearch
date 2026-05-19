# NexusResearch

AI-powered desktop academic research assistant. Integrates literature management, AI-assisted reading, paper writing, and research notes into one unified workspace.

## Features

- **Literature Management** — Import PDFs, auto-extract metadata, generate APA/MLA/GB-T-7714 citations, AI-powered summaries
- **AI-Assisted Reading** — PDF viewer with color-coded highlights, markdown notes, per-paper AI Q&A
- **Paper Writing** — LaTeX editor with live PDF preview, citation insertion, template support, AI polish (academic/concise/expand/preserve modes)
- **Research Scratchpad** — Markdown notes with AI chat for idea development
- **Multi-Model Gateway** — Configure OpenAI, Anthropic, Qwen, DeepSeek APIs independently per module

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Electron 33 + SQLite (better-sqlite3)
- **AI:** Adapter pattern supporting OpenAI, Anthropic, Qwen, DeepSeek
- **PDF:** pdfjs-dist for metadata extraction and rendering
- **LaTeX:** latexmk for compilation

## Getting Started

### Prerequisites

- Node.js >= 18
- npm
- LaTeX distribution (for paper compilation, e.g., TeX Live or MiKTeX)

### Install

```bash
git clone https://github.com/Pitaya618/nexusresearch.git
cd nexusresearch
npm install
```

### Development

```bash
npm run dev
```

This starts Vite dev server, TypeScript watcher, and Electron simultaneously.

### Build

```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux
```

## Project Structure

```
nexusresearch/
├── electron/                    # Electron main process
│   ├── main.ts                  # App entry point
│   ├── preload.ts               # Context bridge
│   ├── ipc-handlers.ts          # All IPC handlers
│   ├── db/                      # SQLite database
│   │   ├── connection.ts        # DB singleton
│   │   ├── migrations.ts        # Schema migrations
│   │   └── repositories/        # Data access layer
│   ├── model-gateway/           # Multi-provider AI gateway
│   │   ├── gateway.ts           # Unified interface
│   │   ├── openai-adapter.ts    # OpenAI adapter
│   │   ├── anthropic-adapter.ts # Anthropic adapter
│   │   ├── qwen-adapter.ts      # Qwen adapter
│   │   └── deepseek-adapter.ts  # DeepSeek adapter
│   └── services/                # Business logic
│       ├── pdf-metadata.ts      # PDF parsing
│       ├── citation.ts          # Citation formatting
│       └── latex-compile.ts     # LaTeX compilation
├── src/                         # React frontend
│   ├── App.tsx                  # Root component with routing
│   ├── components/
│   │   ├── Layout/              # Sidebar + AppLayout
│   │   ├── Onboarding/          # First-run setup wizard
│   │   ├── Settings/            # API key & model binding
│   │   └── common/              # Shared components
│   └── modules/
│       ├── literature/          # Literature management
│       ├── reading/             # PDF reading & annotation
│       ├── scratchpad/          # Research notes + AI
│       └── writing/             # LaTeX paper writing
└── tests/                       # Test files
```

## License

[MIT](LICENSE)
