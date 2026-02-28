# Changelog

All notable changes to Portable Workspace will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0]

### Added
- **Block Editor** — Notion-like block editing powered by BlockNote with slash commands (`/`), drag handles, and rich formatting toolbar
- **Canvas Editor** — Freeform drawing and diagramming with Excalidraw for `.canvas` files
- **Editor Mode Switcher** — Toggle between Block, Markdown, and Canvas editors per file
- **Folder Import via Drag & Drop** — Drag files onto any folder in the sidebar to import directly into it
- **Folder Import via Context Menu** — Right-click a folder → "Import Files Here" to pick files
- **Folder Upload** — Import entire folder structures preserving directory hierarchy
- **`.enclave` Archive Format** — Workspace exports now use `.enclave` extension (ZIP-compatible) with embedded `manifest.json` for metadata
- **ZIP Import** — Both `.zip` and `.enclave` archives are supported for import
- **`manifest.json` in Exports** — Each export includes a manifest tracking file paths, types, and timestamps

### Changed
- **Replaced Novel with BlockNote** — Swapped the block editor from Novel (Tiptap-based) to BlockNote for better slash command support, built-in drag handles, and simpler integration
- **Downgraded Excalidraw** — Moved from `@excalidraw/excalidraw@0.18` to `0.17.6` to fix `Canvas exceeds max size` rendering error
- **Updated `next.config.mjs`** — Replaced Novel/Tiptap transpilePackages with BlockNote package entries
- **Updated block editor CSS** — Replaced old Novel/Tiptap styles with BlockNote CSS variable overrides and suggestion menu highlight fixes

### Fixed
- **Canvas `Canvas exceeds max size` error** — Fixed by adding `min-h-0` to flex containers in `page.tsx` and using delayed mount with dimension measurement in `canvas-editor.tsx`
- **Block editor slash commands not working** — Resolved by switching to BlockNote which handles slash commands natively
- **Suggestion menu keyboard highlight missing** — Added CSS overrides for `[aria-selected]` and `[data-hovered]` states on suggestion menu items

---

## [0.1.0] — 2025-02-19

### Added
- **Markdown Editor** — Rich toolbar with bold, italic, headings, lists, code blocks, links, horizontal rules
- **Live Preview** — Split-pane view with real-time markdown rendering (edit, split, preview modes)
- **File Manager** — Create, rename, delete, and organize files into folders with a tree sidebar
- **Auto-Save** — Changes automatically saved to IndexedDB
- **Import/Export** — Import ZIP workspaces, export workspace as ZIP
- **Drag & Drop** — Drop `.zip` files anywhere to import
- **Keyboard Shortcuts** — `Ctrl+B`, `Ctrl+I`, `Ctrl+K`, `Ctrl+S`, `Tab` indent
- **Responsive Design** — Desktop and mobile layouts with adaptive sidebar
- **Dark Mode** — Dark theme with system preference support
- **100% Private** — Zero server-side storage, all data in browser IndexedDB
- **PWA / Installable** — Service worker for offline support, installable as desktop/mobile app
- **Share via URL** — LZ-string compressed shareable links
- **Vim Keybindings** — Toggle Vim mode with `hjkl`, `dd/yy/p`, `i/a/o`
- **Version History** — Automatic snapshots every 60s with timeline and one-click restore
- **Word & Char Count** — Live counts in status bar
- **Light/Dark Theme Toggle** — System-aware theme switching
- **Print / PDF Export** — Clean print-formatted output
- **Find & Replace** — `Ctrl+H` with find-next, replace, replace-all
- **Pinned Files** — Pin files to the top of the sidebar
- **Syntax Highlighting** — Code block language detection with Prism.js
