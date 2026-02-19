'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster, toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';
import {
  Menu, X, ChevronRight, ChevronDown,
  FileText, File, Folder, FolderOpen,
  FilePlus, FolderPlus, Trash2, Pencil, MoreHorizontal,
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Code, Quote, Link2, Minus,
  Download, Upload, Eye,
  Search, PanelLeftClose, PanelLeft,
  CheckCircle, Loader2, FileDown, Package,
} from 'lucide-react';
import * as storage from '@/lib/storage';

// ===== TYPES =====

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  isDir: boolean;
  type?: string;
}

interface TabData {
  path: string;
  content: string;
  savedContent: string;
  type: string;
}

interface DialogState {
  type: 'newFile' | 'newFolder' | 'rename' | 'delete' | 'clearWorkspace' | null;
  path: string;
  isDir: boolean;
  value: string;
}

interface ToolAction {
  wrap?: { before: string; after: string; placeholder?: string };
  prefix?: string;
  insert?: string;
}

interface ToolItem {
  icon: LucideIcon;
  label: string;
  action: ToolAction;
}

interface FileTreeNodeProps {
  node: TreeNode;
  level?: number;
  activeTab: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onOpenFile: (path: string) => void;
  onDeleteItem: (path: string, isDir: boolean) => void;
  onRenameItem: (path: string, isDir: boolean) => void;
  onNewFileInFolder: (path: string) => void;
}

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  onContentChange: (content: string) => void;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  isMobile: boolean;
}

// ===== CONSTANTS =====

const TEXT_EXTENSIONS = new Set([
  'md', 'txt', 'markdown', 'mdown', 'mkd', 'mdx',
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
  'html', 'htm', 'css', 'scss', 'less', 'sass',
  'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
  'py', 'rb', 'go', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'rs', 'swift', 'kt',
  'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
  'sql', 'graphql', 'gql',
  'env', 'gitignore', 'dockerignore', 'editorconfig',
  'svg', 'csv', 'tsv',
  'r', 'rmd', 'tex', 'bib',
  'vue', 'svelte', 'astro',
  'dockerfile', 'makefile', 'cmake',
  'log', 'lock',
]);

function isTextFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const basename = filename.split('/').pop()?.toLowerCase() || '';
  const specialNames = ['readme', 'license', 'licence', 'makefile', 'dockerfile', 'procfile', '.gitignore', '.env'];
  if (specialNames.includes(basename)) return true;
  return TEXT_EXTENSIONS.has(ext);
}

function getFileIcon(name: string): LucideIcon {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const codeExts = new Set(['js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'go', 'java', 'c', 'cpp', 'rs', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'sh', 'sql']);
  if (codeExts.has(ext)) return Code;
  return FileText;
}

function buildFileTree(files: storage.FileRecord[]): TreeNode {
  const root: TreeNode = { name: 'root', path: '', children: [], isDir: true };
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sorted) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');
      let child = current.children.find(c => c.name === part && c.path === path);

      if (!child) {
        child = {
          name: part,
          path,
          children: [],
          isDir: !isLast || file.type === 'folder',
          type: isLast ? file.type : 'folder',
        };
        current.children.push(child);
      }

      if (!isLast) {
        child.isDir = true;
        child.type = 'folder';
      }
      current = child;
    }
  }

  function sortTree(node: TreeNode): void {
    if (node.children?.length > 0) {
      node.children.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    }
  }
  sortTree(root);
  return root;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const WELCOME_CONTENT = `# Welcome to Portable Workspace

Your private, browser-based markdown editor and file manager.

## Getting Started

- **Import a ZIP** workspace using the upload button in the sidebar
- **Create a new file** using the + button
- **Edit in Markdown** with the built-in editor and live preview
- **Export your work** as a ZIP file anytime

## Features

- **Markdown Editor** with toolbar and live preview
- **File Manager** with folders and search
- **Auto-Save** to browser storage (IndexedDB)
- **Import/Export** ZIP workspaces
- **100% Private** - all data stays in your browser
- **Responsive** - works on desktop and mobile

## Markdown Examples

### Text Formatting

**Bold text**, *italic text*, ~~strikethrough~~, \`inline code\`

### Lists

- Unordered item 1
- Unordered item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2

### Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Blockquote

> This is a blockquote.
> It can span multiple lines.

### Table

| Feature | Status |
|---------|--------|
| Markdown Editor | Done |
| File Manager | Done |
| Auto-Save | Done |
| Import/Export | Done |

### Link

[Visit GitHub](https://github.com)

---

*Start editing this file or create a new one to begin!*
`;

// ===== FILE TREE NODE =====
function FileTreeNode({ node, level = 0, activeTab, expandedFolders, onToggleFolder, onOpenFile, onDeleteItem, onRenameItem, onNewFileInFolder }: FileTreeNodeProps) {
  const isExpanded = expandedFolders.has(node.path);
  const isActive = activeTab === node.path;
  const IconComponent = node.isDir
    ? (isExpanded ? FolderOpen : Folder)
    : getFileIcon(node.name);

  return (
    <div>
      <div
        className={`
          group flex items-center gap-1 px-2 py-1 text-sm cursor-pointer rounded-sm mx-1
          hover:bg-accent/60 transition-colors
          ${isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}
        `}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
        onClick={() => {
          if (node.isDir) onToggleFolder(node.path);
          else onOpenFile(node.path);
        }}
      >
        {node.isDir ? (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        ) : (
          <span className="w-4 h-4 flex-shrink-0" />
        )}

        <IconComponent className={`w-4 h-4 flex-shrink-0 ${node.isDir ? 'text-sky-400' : 'text-slate-400'}`} />
        <span className="truncate flex-1 text-xs">{node.name}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent/80 transition-opacity flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {node.isDir && (
              <>
                <DropdownMenuItem onClick={() => onNewFileInFolder(node.path)}>
                  <FilePlus className="w-4 h-4 mr-2" />
                  New File Here
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onRenameItem(node.path, node.isDir)}>
              <Pencil className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteItem(node.path, node.isDir)}
              className="text-red-400 focus:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {node.isDir && isExpanded && node.children.map(child => (
        <FileTreeNode
          key={child.path}
          node={child}
          level={level + 1}
          activeTab={activeTab}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          onOpenFile={onOpenFile}
          onDeleteItem={onDeleteItem}
          onRenameItem={onRenameItem}
          onNewFileInFolder={onNewFileInFolder}
        />
      ))}
    </div>
  );
}

// ===== MARKDOWN TOOLBAR =====
function MarkdownToolbar({ textareaRef, content, onContentChange, viewMode, onViewModeChange, isMobile }: MarkdownToolbarProps) {
  const applyAction = useCallback((action: ToolAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content || '';
    const selected = text.substring(start, end);
    let newText: string | undefined, newStart: number | undefined, newEnd: number | undefined;

    if (action.wrap) {
      const { before, after, placeholder } = action.wrap;
      const insert = selected || placeholder || '';
      newText = text.substring(0, start) + before + insert + after + text.substring(end);
      newStart = start + before.length;
      newEnd = newStart + insert.length;
    } else if (action.prefix) {
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const lineEndIdx = text.indexOf('\n', start);
      const lineEnd = lineEndIdx === -1 ? text.length : lineEndIdx;
      const line = text.substring(lineStart, lineEnd);

      if (line.startsWith(action.prefix)) {
        newText = text.substring(0, lineStart) + line.substring(action.prefix.length) + text.substring(lineEnd);
        newStart = Math.max(lineStart, start - action.prefix.length);
        newEnd = newStart;
      } else {
        newText = text.substring(0, lineStart) + action.prefix + text.substring(lineStart);
        newStart = start + action.prefix.length;
        newEnd = end + action.prefix.length;
      }
    } else if (action.insert) {
      newText = text.substring(0, start) + action.insert + text.substring(end);
      newStart = start + action.insert.length;
      newEnd = newStart;
    }

    if (newText !== undefined && newStart !== undefined && newEnd !== undefined) {
      onContentChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newStart, newEnd);
      }, 10);
    }
  }, [content, onContentChange, textareaRef]);

  const tools: (ToolItem | 'sep')[] = [
    { icon: Bold, label: 'Bold (Ctrl+B)', action: { wrap: { before: '**', after: '**', placeholder: 'bold' } } },
    { icon: Italic, label: 'Italic (Ctrl+I)', action: { wrap: { before: '*', after: '*', placeholder: 'italic' } } },
    'sep',
    { icon: Heading1, label: 'Heading 1', action: { prefix: '# ' } },
    { icon: Heading2, label: 'Heading 2', action: { prefix: '## ' } },
    { icon: Heading3, label: 'Heading 3', action: { prefix: '### ' } },
    'sep',
    { icon: List, label: 'Bullet List', action: { prefix: '- ' } },
    { icon: ListOrdered, label: 'Numbered List', action: { prefix: '1. ' } },
    'sep',
    { icon: Code, label: 'Inline Code', action: { wrap: { before: '`', after: '`', placeholder: 'code' } } },
    { icon: Quote, label: 'Blockquote', action: { prefix: '> ' } },
    { icon: Link2, label: 'Link (Ctrl+K)', action: { wrap: { before: '[', after: '](url)', placeholder: 'link text' } } },
    { icon: Minus, label: 'Horizontal Rule', action: { insert: '\n---\n' } },
  ];

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-card/50 overflow-x-auto flex-shrink-0">
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-0.5 mr-auto">
          {tools.map((tool, i) => {
            if (tool === 'sep') return <Separator key={i} orientation="vertical" className="h-5 mx-0.5" />;
            const Icon = tool.icon;
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0" onClick={() => applyAction(tool.action)}>
                    <Icon className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{tool.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2.5 text-xs gap-1"
                onClick={() => onViewModeChange('edit')}
              >
                <Pencil className="w-3 h-3" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Editor only</TooltipContent>
          </Tooltip>

          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2.5 text-xs gap-1"
                  onClick={() => onViewModeChange('split')}
                >
                  <PanelLeft className="w-3 h-3" />
                  <span className="hidden sm:inline">Split</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Split view</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2.5 text-xs gap-1"
                onClick={() => onViewModeChange('preview')}
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Preview only</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

// ===== MAIN WORKSPACE PAGE =====
export default function WorkspacePage() {
  const [files, setFiles] = useState<storage.FileRecord[]>([]);
  const [openTabs, setOpenTabs] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('split');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, path: '', isDir: false, value: '' });
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== COMPUTED =====
  const activeTabData = useMemo(() => openTabs.find(t => t.path === activeTab), [openTabs, activeTab]);
  const isDirty = useMemo(() => activeTabData ? activeTabData.content !== activeTabData.savedContent : false, [activeTabData]);
  const hasAnyDirty = useMemo(() => openTabs.some(t => t.content !== t.savedContent), [openTabs]);
  const fileTree = useMemo(() => buildFileTree(files), [files]);

  const filteredTree = useMemo(() => {
    if (!searchQuery) return fileTree;
    const query = searchQuery.toLowerCase();
    const matching = files.filter(f => f.path.toLowerCase().includes(query) && f.type !== 'folder');
    return buildFileTree(matching);
  }, [fileTree, files, searchQuery]);

  // ===== LOAD FILES =====
  useEffect(() => {
    async function init() {
      try {
        let allFiles = await storage.getAllFiles();
        if (allFiles.length === 0) {
          await storage.saveFile({ path: 'welcome.md', content: WELCOME_CONTENT, type: 'text', createdAt: Date.now() });
          allFiles = await storage.getAllFiles();
        }
        setFiles(allFiles);

        try {
          const saved = localStorage.getItem('pw-state');
          if (saved) {
            const s = JSON.parse(saved);
            if (s.openTabPaths?.length > 0) {
              const tabs: TabData[] = [];
              for (const p of s.openTabPaths) {
                const f = allFiles.find(x => x.path === p);
                if (f && f.type !== 'folder') tabs.push({ path: f.path, content: f.content, savedContent: f.content, type: f.type });
              }
              if (tabs.length > 0) {
                setOpenTabs(tabs);
                setActiveTab(tabs.some(t => t.path === s.activeTabPath) ? s.activeTabPath : tabs[0].path);
              }
            }
            if (s.expandedFolders) setExpandedFolders(new Set(s.expandedFolders));
            if (s.sidebarOpen !== undefined) setSidebarOpen(s.sidebarOpen);
            if (s.viewMode) setViewMode(s.viewMode);
          }
        } catch (e) { /* ignore */ }
      } catch (err) {
        console.error('Failed to load:', err);
        toast.error('Failed to load workspace');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // ===== PERSIST UI STATE =====
  useEffect(() => {
    if (loading) return;
    try {
      localStorage.setItem('pw-state', JSON.stringify({
        openTabPaths: openTabs.map(t => t.path),
        activeTabPath: activeTab,
        expandedFolders: [...expandedFolders],
        sidebarOpen,
        viewMode,
      }));
    } catch (e) { /* ignore */ }
  }, [openTabs, activeTab, expandedFolders, sidebarOpen, viewMode, loading]);

  // ===== MOBILE DETECTION =====
  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setViewMode(prev => prev === 'split' ? 'edit' : prev);
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ===== BEFOREUNLOAD =====
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (hasAnyDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasAnyDirty]);

  // ===== AUTO-SAVE =====
  const autoSave = useCallback(async (path: string, content: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const existing = await storage.getFile(path);
        await storage.saveFile({ path, content, type: existing?.type || 'text', createdAt: existing?.createdAt || Date.now() });
        setOpenTabs(prev => prev.map(t => t.path === path ? { ...t, savedContent: content } : t));
        setFiles(prev => prev.map(f => f.path === path ? { ...f, content, updatedAt: Date.now() } : f));
      } catch (err) {
        console.error('Auto-save failed:', err);
        toast.error('Auto-save failed');
      } finally {
        setSaving(false);
      }
    }, 600);
  }, []);

  // ===== FILE OPERATIONS =====
  const openFile = useCallback(async (path: string) => {
    const existing = openTabs.find(t => t.path === path);
    if (existing) { setActiveTab(path); if (isMobile) setMobileSidebarOpen(false); return; }

    const file = await storage.getFile(path);
    if (!file || file.type === 'folder') return;

    setOpenTabs(prev => [...prev, { path: file.path, content: file.content, savedContent: file.content, type: file.type }]);
    setActiveTab(path);
    if (isMobile) setMobileSidebarOpen(false);
  }, [openTabs, isMobile]);

  const closeTab = useCallback((path: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const tab = openTabs.find(t => t.path === path);
    if (tab && tab.content !== tab.savedContent) {
      storage.saveFile({ path: tab.path, content: tab.content, type: tab.type || 'text', createdAt: Date.now() }).catch(console.error);
      setFiles(prev => prev.map(f => f.path === path ? { ...f, content: tab.content } : f));
    }
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.path !== path);
      if (activeTab === path) {
        const idx = prev.findIndex(t => t.path === path);
        setActiveTab(newTabs[Math.min(idx, newTabs.length - 1)]?.path || null);
      }
      return newTabs;
    });
  }, [openTabs, activeTab]);

  const updateContent = useCallback((newContent: string) => {
    if (!activeTab) return;
    setOpenTabs(prev => prev.map(t => t.path === activeTab ? { ...t, content: newContent } : t));
    autoSave(activeTab, newContent);
  }, [activeTab, autoSave]);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const createFile = useCallback(async (name: string, parentPath = '') => {
    const fullPath = parentPath ? `${parentPath}/${name}` : name;
    const existing = await storage.getFile(fullPath);
    if (existing) { toast.error('File already exists'); return; }

    const isMd = fullPath.endsWith('.md') || fullPath.endsWith('.markdown') || fullPath.endsWith('.mdx');
    const content = isMd ? `# ${name.replace(/\.(md|markdown|mdx)$/, '')}\n\n` : '';
    await storage.saveFile({ path: fullPath, content, type: 'text', createdAt: Date.now() });

    const allFiles = await storage.getAllFiles();
    setFiles(allFiles);
    if (parentPath) setExpandedFolders(prev => new Set([...prev, parentPath]));
    openFile(fullPath);
    toast.success(`Created ${name}`);
  }, [openFile]);

  const createFolder = useCallback(async (name: string, parentPath = '') => {
    const fullPath = parentPath ? `${parentPath}/${name}` : name;
    await storage.saveFile({ path: fullPath, content: '', type: 'folder', createdAt: Date.now() });
    const allFiles = await storage.getAllFiles();
    setFiles(allFiles);
    setExpandedFolders(prev => new Set([...prev, parentPath, fullPath].filter(Boolean)));
    toast.success(`Created folder ${name}`);
  }, []);

  const handleRename = useCallback(async (oldPath: string, newName: string, isDir: boolean) => {
    const parts = oldPath.split('/');
    parts[parts.length - 1] = newName;
    const newPath = parts.join('/');
    if (oldPath === newPath) return;

    try {
      if (isDir) await storage.renameFolder(oldPath, newPath);
      else await storage.renameFile(oldPath, newPath);

      const allFiles = await storage.getAllFiles();
      setFiles(allFiles);
      setOpenTabs(prev => prev.map(t => {
        if (t.path === oldPath) return { ...t, path: newPath };
        if (isDir && t.path.startsWith(oldPath + '/')) return { ...t, path: newPath + t.path.substring(oldPath.length) };
        return t;
      }));
      if (activeTab === oldPath) setActiveTab(newPath);
      if (isDir && activeTab?.startsWith(oldPath + '/')) setActiveTab(newPath + activeTab.substring(oldPath.length));
      toast.success('Renamed successfully');
    } catch (err) {
      console.error('Rename failed:', err);
      toast.error('Rename failed');
    }
  }, [activeTab]);

  const handleDelete = useCallback(async (path: string, isDir: boolean) => {
    try {
      if (isDir) await storage.deleteByPrefix(path);
      else await storage.deleteFile(path);

      const allFiles = await storage.getAllFiles();
      setFiles(allFiles);
      setOpenTabs(prev => {
        const newTabs = prev.filter(t => {
          if (t.path === path) return false;
          if (isDir && t.path.startsWith(path + '/')) return false;
          return true;
        });
        if (!newTabs.some(t => t.path === activeTab)) setActiveTab(newTabs[0]?.path || null);
        return newTabs;
      });
      toast.success('Deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  }, [activeTab]);

  // ===== IMPORT/EXPORT =====
  const handleImportZip = useCallback(async (file: globalThis.File) => {
    try {
      toast.info('Importing workspace...');
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      const newFiles: { path: string; content: string; type: string; createdAt: number }[] = [];
      const entries = Object.entries(zip.files);

      let commonPrefix = '';
      const nonDir = entries.filter(([_, e]) => !e.dir);
      if (nonDir.length > 0) {
        const paths = nonDir.map(([p]) => p);
        const first = paths[0].split('/');
        if (first.length > 1 && paths.every(p => p.startsWith(first[0] + '/'))) {
          commonPrefix = first[0] + '/';
        }
      }

      for (const [path, entry] of entries) {
        if (entry.dir) continue;
        let clean = path;
        if (commonPrefix && clean.startsWith(commonPrefix)) clean = clean.substring(commonPrefix.length);
        if (!clean || clean.startsWith('__MACOSX') || clean.includes('.DS_Store')) continue;

        if (isTextFile(clean)) {
          const content = await entry.async('string');
          newFiles.push({ path: clean, content, type: 'text', createdAt: Date.now() });
        } else {
          const content = await entry.async('base64');
          newFiles.push({ path: clean, content, type: 'binary', createdAt: Date.now() });
        }
      }

      if (newFiles.length === 0) { toast.error('No files found in ZIP'); return; }

      await storage.bulkSave(newFiles);
      const allFiles = await storage.getAllFiles();
      setFiles(allFiles);

      const firstText = newFiles.find(f => f.type === 'text');
      if (firstText) openFile(firstText.path);

      const rootFolders = new Set(newFiles.map(f => f.path.split('/')[0]).filter(p => newFiles.some(f => f.path.startsWith(p + '/'))));
      setExpandedFolders(prev => new Set([...prev, ...rootFolders]));
      toast.success(`Imported ${newFiles.length} files`);
    } catch (err) {
      console.error('Import failed:', err);
      toast.error('Failed to import ZIP');
    }
  }, [openFile]);

  const handleExportZip = useCallback(async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const allFiles = await storage.getAllFiles();

      for (const file of allFiles) {
        if (file.type === 'folder') continue;
        if (file.type === 'binary') zip.file(file.path, file.content, { base64: true });
        else zip.file(file.path, file.content || '');
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, 'workspace.zip');
      toast.success('Workspace exported as ZIP');
    } catch (err) {
      toast.error('Export failed');
    }
  }, []);

  const handleExportFile = useCallback(() => {
    if (!activeTabData) return;
    const blob = new Blob([activeTabData.content], { type: 'text/plain' });
    downloadBlob(blob, activeTabData.path.split('/').pop() || 'file');
    toast.success('File exported');
  }, [activeTabData]);

  const handleClearWorkspace = useCallback(async () => {
    await storage.clearAll();
    setFiles([]);
    setOpenTabs([]);
    setActiveTab(null);
    setExpandedFolders(new Set());
    localStorage.removeItem('pw-state');
    toast.success('Workspace cleared');
  }, []);

  // ===== DRAG & DROP =====
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer?.files;
    if (items?.length > 0) {
      const file = items[0];
      if (file.name.endsWith('.zip')) {
        handleImportZip(file);
      } else if (isTextFile(file.name)) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          await storage.saveFile({ path: file.name, content: ev.target?.result as string, type: 'text', createdAt: Date.now() });
          const allFiles = await storage.getAllFiles();
          setFiles(allFiles);
          openFile(file.name);
          toast.success(`Imported ${file.name}`);
        };
        reader.readAsText(file);
      }
    }
  }, [handleImportZip, openFile]);

  // ===== KEYBOARD SHORTCUTS ON TEXTAREA =====
  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const textarea = textareaRef.current;
      const text = activeTabData?.content || '';

      if (e.key === 's') {
        e.preventDefault();
        if (activeTab) autoSave(activeTab, text);
        toast.success('Saved');
      } else if (e.key === 'b' && textarea) {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const sel = text.substring(start, end) || 'bold';
        const newText = text.substring(0, start) + '**' + sel + '**' + text.substring(end);
        updateContent(newText);
        setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 2, start + 2 + sel.length); }, 10);
      } else if (e.key === 'i' && textarea) {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const sel = text.substring(start, end) || 'italic';
        const newText = text.substring(0, start) + '*' + sel + '*' + text.substring(end);
        updateContent(newText);
        setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 1, start + 1 + sel.length); }, 10);
      } else if (e.key === 'k' && textarea) {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const sel = text.substring(start, end) || 'link text';
        const newText = text.substring(0, start) + '[' + sel + '](url)' + text.substring(end);
        updateContent(newText);
        setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 1, start + 1 + sel.length); }, 10);
      }
    }

    // Tab key inserts spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = activeTabData?.content || '';
      const newText = text.substring(0, start) + '  ' + text.substring(end);
      updateContent(newText);
      setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 2, start + 2); }, 10);
    }
  }, [activeTab, activeTabData, autoSave, updateContent]);

  // ===== DIALOG HELPERS =====
  const openDialog = (type: DialogState['type'], path = '', isDir = false) => {
    setDialogState({ type, path, isDir, value: type === 'rename' ? (path.split('/').pop() || '') : '' });
  };
  const closeDialog = () => setDialogState({ type: null, path: '', isDir: false, value: '' });

  const confirmDialog = async () => {
    const { type, path, isDir, value } = dialogState;
    if (type === 'newFile') {
      const name = value.trim();
      if (!name) return;
      await createFile(name.includes('.') ? name : name + '.md', path);
    } else if (type === 'newFolder') {
      const name = value.trim();
      if (!name) return;
      await createFolder(name, path);
    } else if (type === 'rename') {
      const name = value.trim();
      if (!name) return;
      await handleRename(path, name, isDir);
    } else if (type === 'delete') {
      await handleDelete(path, isDir);
    } else if (type === 'clearWorkspace') {
      await handleClearWorkspace();
    }
    closeDialog();
  };

  // ===== SIDEBAR CONTENT =====
  const sidebarContent = (
    <div className="flex flex-col h-full bg-card/30">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Explorer</span>
        <div className="flex items-center gap-0.5">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openDialog('newFile')}>
                  <FilePlus className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">New File</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openDialog('newFolder')}>
                  <FolderPlus className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">New Folder</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Import ZIP</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="px-2 py-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="h-7 pl-7 text-xs bg-background/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1">
          {filteredTree.children.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              <p className="font-medium">No files yet</p>
              <p className="mt-1 opacity-70">Create a file or import a ZIP</p>
            </div>
          ) : (
            filteredTree.children.map(node => (
              <FileTreeNode
                key={node.path}
                node={node}
                level={0}
                activeTab={activeTab}
                expandedFolders={expandedFolders}
                onToggleFolder={toggleFolder}
                onOpenFile={openFile}
                onDeleteItem={(p, d) => openDialog('delete', p, d)}
                onRenameItem={(p, d) => openDialog('rename', p, d)}
                onNewFileInFolder={(p) => openDialog('newFile', p)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-2 space-y-0.5">
        <Button variant="ghost" size="sm" className="w-full justify-start h-7 text-xs gap-2" onClick={handleExportZip}>
          <Download className="w-3.5 h-3.5" />
          Export Workspace (ZIP)
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start h-7 text-xs gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => openDialog('clearWorkspace')}>
          <Trash2 className="w-3.5 h-3.5" />
          Clear Workspace
        </Button>
      </div>
    </div>
  );

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const showEmptyState = files.length === 0;

  return (
    <div
      className={`h-screen flex flex-col bg-background overflow-hidden ${isDragging ? 'drop-zone-active' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setIsDragging(false); }}
    >
      <Toaster position="bottom-right" theme="dark" richColors />

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportZip(file);
          e.target.value = '';
        }}
      />

      {/* HEADER */}
      <header className="h-10 border-b border-border flex items-center px-2 bg-card/30 flex-shrink-0">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isMobile ? (
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                {sidebarContent}
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </Button>
          )}
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold hidden sm:inline tracking-wide">Portable Workspace</span>
          </div>
        </div>

        {/* TAB BAR */}
        <div className="flex-1 flex items-center ml-2 overflow-x-auto scrollbar-hide">
          {openTabs.map(tab => {
            const isAct = tab.path === activeTab;
            const dirty = tab.content !== tab.savedContent;
            const name = tab.path.split('/').pop() || tab.path;
            return (
              <div
                key={tab.path}
                className={`
                  flex items-center gap-1.5 px-3 py-1 text-xs cursor-pointer border-r border-border/50
                  transition-all whitespace-nowrap flex-shrink-0
                  ${isAct
                    ? 'bg-background text-foreground border-b-2 border-b-primary -mb-px'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}
                `}
                onClick={() => setActiveTab(tab.path)}
                onMouseDown={(e) => { if (e.button === 1) closeTab(tab.path, e); }}
              >
                {dirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                <span className="max-w-[100px] truncate">{name}</span>
                <button className="p-0.5 rounded hover:bg-muted transition-colors flex-shrink-0" onClick={(e) => closeTab(tab.path, e)}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
          {activeTabData && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleExportFile}>
                    <FileDown className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Export File</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Import ZIP
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportZip}>
                <Download className="w-4 h-4 mr-2" /> Export Workspace
              </DropdownMenuItem>
              {activeTabData && (
                <DropdownMenuItem onClick={handleExportFile}>
                  <FileDown className="w-4 h-4 mr-2" /> Export Current File
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDialog('newFile')}>
                <FilePlus className="w-4 h-4 mr-2" /> New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialog('newFolder')}>
                <FolderPlus className="w-4 h-4 mr-2" /> New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && sidebarOpen && (
          <div className="w-56 border-r border-border flex-shrink-0">
            {sidebarContent}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showEmptyState ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Package className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Portable Workspace</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your private, browser-based file editor. All data stays securely in your browser - nothing is sent to any server.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => fileInputRef.current?.click()} className="gap-2" size="lg">
                    <Upload className="w-4 h-4" /> Import ZIP
                  </Button>
                  <Button variant="outline" onClick={() => openDialog('newFile')} className="gap-2" size="lg">
                    <FilePlus className="w-4 h-4" /> New File
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Drag & drop a ZIP file anywhere to import</p>
              </div>
            </div>
          ) : activeTabData ? (
            <>
              <MarkdownToolbar
                textareaRef={textareaRef}
                content={activeTabData.content}
                onContentChange={updateContent}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isMobile={isMobile}
              />

              <div className="flex-1 overflow-hidden">
                {activeTabData.type === 'binary' ? (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <div className="text-center space-y-2 text-muted-foreground">
                      <File className="w-12 h-12 mx-auto opacity-40" />
                      <p className="text-sm font-medium">Binary File</p>
                      <p className="text-xs">This file cannot be edited in the browser</p>
                    </div>
                  </div>
                ) : viewMode === 'edit' ? (
                  <textarea
                    ref={textareaRef}
                    className="editor-textarea w-full h-full p-4 bg-background text-foreground font-mono text-sm resize-none outline-none leading-relaxed"
                    value={activeTabData.content}
                    onChange={(e) => updateContent(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    spellCheck={false}
                    placeholder="Start typing..."
                  />
                ) : viewMode === 'preview' ? (
                  <ScrollArea className="h-full">
                    <div className="p-6 max-w-3xl mx-auto">
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeTabData.content}</ReactMarkdown>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <PanelGroup direction="horizontal">
                    <Panel defaultSize={50} minSize={25}>
                      <textarea
                        ref={textareaRef}
                        className="editor-textarea w-full h-full p-4 bg-background text-foreground font-mono text-sm resize-none outline-none leading-relaxed"
                        value={activeTabData.content}
                        onChange={(e) => updateContent(e.target.value)}
                        onKeyDown={handleEditorKeyDown}
                        spellCheck={false}
                        placeholder="Start typing..."
                      />
                    </Panel>
                    <PanelResizeHandle className="w-1.5 bg-border/50 hover:bg-primary/40 transition-colors cursor-col-resize resize-handle" />
                    <Panel defaultSize={50} minSize={20}>
                      <ScrollArea className="h-full">
                        <div className="p-6">
                          <div className="markdown-body">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeTabData.content}</ReactMarkdown>
                          </div>
                        </div>
                      </ScrollArea>
                    </Panel>
                  </PanelGroup>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-3">
                <FileText className="w-14 h-14 mx-auto opacity-20" />
                <p className="text-sm font-medium">No file selected</p>
                <p className="text-xs opacity-70">Choose a file from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STATUS BAR */}
      <footer className="h-6 border-t border-border flex items-center px-3 bg-card/30 text-[10px] text-muted-foreground flex-shrink-0">
        <div className="flex items-center gap-3">
          {saving ? (
            <span className="flex items-center gap-1 text-sky-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          ) : isDirty ? (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Modified
            </span>
          ) : activeTab ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3 h-3" /> Saved
            </span>
          ) : null}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          {activeTab && <span className="opacity-70">{activeTab}</span>}
          <span>{files.filter(f => f.type !== 'folder').length} files</span>
          <span className="opacity-70">IndexedDB</span>
        </div>
      </footer>

      {/* DIALOGS */}
      <Dialog open={dialogState.type === 'newFile'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New File</DialogTitle>
            <DialogDescription>
              {dialogState.path ? `Create in ${dialogState.path}/` : 'Create in workspace root'}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="filename.md"
            value={dialogState.value}
            onChange={(e) => setDialogState(prev => ({ ...prev, value: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && confirmDialog()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={confirmDialog}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogState.type === 'newFolder'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
            <DialogDescription>
              {dialogState.path ? `Create in ${dialogState.path}/` : 'Create in workspace root'}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="folder-name"
            value={dialogState.value}
            onChange={(e) => setDialogState(prev => ({ ...prev, value: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && confirmDialog()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={confirmDialog}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogState.type === 'rename'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename {dialogState.isDir ? 'Folder' : 'File'}</DialogTitle>
            <DialogDescription>Enter a new name</DialogDescription>
          </DialogHeader>
          <Input
            value={dialogState.value}
            onChange={(e) => setDialogState(prev => ({ ...prev, value: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && confirmDialog()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={confirmDialog}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogState.type === 'delete'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {dialogState.isDir ? 'Folder' : 'File'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong className="text-foreground">{dialogState.path}</strong>?
              {dialogState.isDir && ' This will delete all files inside.'}
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDialog}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogState.type === 'clearWorkspace'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear Workspace</DialogTitle>
            <DialogDescription>
              This will permanently delete all files. Consider exporting as a ZIP first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDialog}>Clear All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
