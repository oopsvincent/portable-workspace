# 📦 Portable Workspace

A **private, browser-based** workspace with a Notion-like block editor, canvas drawing, and full file management. All your data stays in your browser — nothing is ever sent to a server.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## ✨ Features

### Editors
- **📝 Block Editor** — Notion-like editing powered by [BlockNote](https://www.blocknotejs.org/) with slash commands, drag handles, and rich formatting
- **✏️ Markdown Editor** — Raw markdown editing with a rich toolbar (bold, italic, headings, lists, code blocks, links)
- **🎨 Canvas Editor** — Freeform drawing and diagramming powered by [Excalidraw](https://excalidraw.com/) (`.canvas` files)
- **👁️ Live Preview** — Split-pane, edit-only, or preview-only modes for markdown

### File Management
- **📁 File Manager** — Create, rename, delete, and organize files into folders with a tree sidebar
- **📂 Folder Import** — Drag & drop files directly onto folders, or use "Import Files Here" from folder context menu
- **📦 Import/Export** — Import ZIP / `.enclave` archives or export your entire workspace as `.enclave`
- **🗂️ Folder Upload** — Import entire folder structures preserving hierarchy
- **🖱️ Drag & Drop** — Drop files or archives anywhere to import instantly

### Editor Features
- **💾 Auto-Save** — Changes are automatically saved to IndexedDB
- **⌨️ Keyboard Shortcuts** — `Ctrl+B` (bold), `Ctrl+I` (italic), `Ctrl+K` (link), `Ctrl+S` (save), `Tab` (indent)
- **⌨️ Vim Keybindings** — Toggle Vim mode with `hjkl` navigation, `dd/yy/p`, `i/a/o` insert, and more
- **🔍 Find & Replace** — `Ctrl+H` to open find & replace bar with find-next, replace, and replace-all
- **📜 Version History** — Automatic snapshots every 60s with visual timeline and one-click restore
- **📊 Word & Char Count** — Live counts in the status bar

### Platform
- **📲 PWA / Installable** — Install as a desktop or mobile app, works fully offline
- **🔗 Share via URL** — Compress any file into a shareable link using LZ-string encoding
- **🌗 Light/Dark Theme** — Toggle with system preference support
- **🖨️ Print / PDF Export** — Print any file or save as PDF with clean formatting
- **📌 Pinned Files** — Pin frequently used files to the top of the sidebar
- **📱 Responsive** — Works on desktop and mobile with an adaptive sidebar
- **🔒 100% Private** — Zero server-side storage, everything lives in your browser's IndexedDB

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/oopsvincent/portable-workspace.git
cd portable-workspace

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | React framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | UI components (Radix UI primitives) |
| [BlockNote](https://www.blocknotejs.org/) | Notion-like block editor |
| [Excalidraw](https://excalidraw.com/) | Canvas / drawing editor |
| [Lucide React](https://lucide.dev/) | Icons |
| [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | Split pane editor/preview |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |
| [JSZip](https://stuk.github.io/jszip/) | ZIP import/export |
| [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Browser-local storage |
| [LZ-String](https://pieroxy.net/blog/pages/lz-string/index.html) | URL-safe content compression for sharing |

## 📁 Project Structure

```
portable-workspace/
├── app/
│   ├── api/             # API routes
│   ├── globals.css      # Global styles & CSS variables
│   ├── layout.tsx       # Root layout (PWA metadata)
│   └── page.tsx         # Main workspace page
├── components/
│   ├── editors/
│   │   ├── block-editor.tsx   # BlockNote block editor
│   │   └── canvas-editor.tsx  # Excalidraw canvas editor
│   └── ui/              # shadcn/ui components
├── docs/
│   └── CHANGELOG.md     # Project changelog
├── lib/
│   ├── storage.ts       # IndexedDB storage + version history
│   ├── utils.ts         # Utility functions
│   └── vim.ts           # Vim keybinding engine
├── public/
│   ├── icon.svg         # PWA app icon
│   ├── manifest.json    # PWA manifest
│   └── sw.js            # Service worker (offline support)
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please read the [changelog](docs/CHANGELOG.md) for recent changes before contributing.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ as a FOSS project · <a href="docs/CHANGELOG.md">Changelog</a>
</p>
