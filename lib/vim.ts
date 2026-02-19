// Lightweight Vim keybinding engine for textarea
// Supports: Normal mode (hjkl, w, b, 0, $, gg, G, x, dd, yy, p, o, O, i, a, A, I)
//           Insert mode (type normally, Escape to exit)

export type VimMode = 'normal' | 'insert';

interface VimState {
  mode: VimMode;
  register: string; // yanked text
  pendingKey: string | null; // for multi-key commands like gg, dd, yy
}

interface VimResult {
  mode: VimMode;
  content?: string;
  cursorPos?: number;
  preventDefault: boolean;
}

let state: VimState = {
  mode: 'normal',
  register: '',
  pendingKey: null,
};

export function getVimMode(): VimMode {
  return state.mode;
}

export function resetVim(): void {
  state = { mode: 'normal', register: '', pendingKey: null };
}

export function setVimMode(mode: VimMode): void {
  state.mode = mode;
}

function getLineInfo(text: string, pos: number) {
  const before = text.substring(0, pos);
  const lineStart = before.lastIndexOf('\n') + 1;
  const lineEnd = text.indexOf('\n', pos);
  const end = lineEnd === -1 ? text.length : lineEnd;
  const line = text.substring(lineStart, end);
  const col = pos - lineStart;
  const lineNum = before.split('\n').length - 1;
  return { lineStart, lineEnd: end, line, col, lineNum };
}

function getLines(text: string): string[] {
  return text.split('\n');
}

function lineStartPos(text: string, lineIdx: number): number {
  const lines = getLines(text);
  let pos = 0;
  for (let i = 0; i < lineIdx && i < lines.length; i++) {
    pos += lines[i].length + 1;
  }
  return pos;
}

export function handleVimKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  textarea: HTMLTextAreaElement,
  content: string,
  setContent: (c: string) => void
): VimResult {
  // In insert mode, only intercept Escape
  if (state.mode === 'insert') {
    if (e.key === 'Escape') {
      state.mode = 'normal';
      return { mode: 'normal', preventDefault: true };
    }
    return { mode: 'insert', preventDefault: false };
  }

  // Normal mode
  const pos = textarea.selectionStart;
  const text = content || '';
  const info = getLineInfo(text, pos);
  const lines = getLines(text);

  // Handle pending keys (gg, dd, yy)
  if (state.pendingKey) {
    const combo = state.pendingKey + e.key;
    state.pendingKey = null;

    if (combo === 'gg') {
      return { mode: 'normal', cursorPos: 0, preventDefault: true };
    }
    if (combo === 'dd') {
      // Delete current line
      const lineWithNewline = info.lineEnd < text.length
        ? text.substring(info.lineStart, info.lineEnd + 1)
        : (info.lineStart > 0
          ? text.substring(info.lineStart - 1, info.lineEnd)
          : text.substring(info.lineStart, info.lineEnd));
      state.register = info.line;

      let newText: string;
      if (info.lineEnd < text.length) {
        newText = text.substring(0, info.lineStart) + text.substring(info.lineEnd + 1);
      } else if (info.lineStart > 0) {
        newText = text.substring(0, info.lineStart - 1) + text.substring(info.lineEnd);
      } else {
        newText = '';
      }
      const newPos = Math.min(info.lineStart, newText.length);
      setContent(newText);
      return { mode: 'normal', content: newText, cursorPos: newPos, preventDefault: true };
    }
    if (combo === 'yy') {
      state.register = info.line;
      return { mode: 'normal', preventDefault: true };
    }
    return { mode: 'normal', preventDefault: true };
  }

  // Multi-key starters
  if (e.key === 'g' || e.key === 'd' || e.key === 'y') {
    state.pendingKey = e.key;
    return { mode: 'normal', preventDefault: true };
  }

  // Single-key commands
  switch (e.key) {
    // Movement
    case 'h': {
      const newPos = Math.max(0, pos - 1);
      return { mode: 'normal', cursorPos: newPos, preventDefault: true };
    }
    case 'l': {
      const newPos = Math.min(text.length, pos + 1);
      return { mode: 'normal', cursorPos: newPos, preventDefault: true };
    }
    case 'j': {
      // Move down one line
      if (info.lineNum < lines.length - 1) {
        const nextLineStart = lineStartPos(text, info.lineNum + 1);
        const nextLineLen = lines[info.lineNum + 1].length;
        const newCol = Math.min(info.col, nextLineLen);
        return { mode: 'normal', cursorPos: nextLineStart + newCol, preventDefault: true };
      }
      return { mode: 'normal', preventDefault: true };
    }
    case 'k': {
      // Move up one line
      if (info.lineNum > 0) {
        const prevLineStart = lineStartPos(text, info.lineNum - 1);
        const prevLineLen = lines[info.lineNum - 1].length;
        const newCol = Math.min(info.col, prevLineLen);
        return { mode: 'normal', cursorPos: prevLineStart + newCol, preventDefault: true };
      }
      return { mode: 'normal', preventDefault: true };
    }
    case 'w': {
      // Next word
      const match = text.substring(pos).match(/\S+\s*/);
      if (match) {
        return { mode: 'normal', cursorPos: pos + match[0].length, preventDefault: true };
      }
      return { mode: 'normal', preventDefault: true };
    }
    case 'b': {
      // Previous word
      const before = text.substring(0, pos);
      const match = before.match(/\s*\S+$/);
      if (match) {
        return { mode: 'normal', cursorPos: pos - match[0].length, preventDefault: true };
      }
      return { mode: 'normal', cursorPos: 0, preventDefault: true };
    }
    case '0': {
      return { mode: 'normal', cursorPos: info.lineStart, preventDefault: true };
    }
    case '$': {
      return { mode: 'normal', cursorPos: info.lineEnd, preventDefault: true };
    }

    // Enter insert mode
    case 'i': {
      state.mode = 'insert';
      return { mode: 'insert', preventDefault: true };
    }
    case 'a': {
      state.mode = 'insert';
      return { mode: 'insert', cursorPos: Math.min(pos + 1, text.length), preventDefault: true };
    }
    case 'I': {
      state.mode = 'insert';
      // Move to first non-whitespace character
      const firstChar = info.line.search(/\S/);
      return { mode: 'insert', cursorPos: info.lineStart + (firstChar === -1 ? 0 : firstChar), preventDefault: true };
    }
    case 'A': {
      state.mode = 'insert';
      return { mode: 'insert', cursorPos: info.lineEnd, preventDefault: true };
    }
    case 'o': {
      // Open new line below
      state.mode = 'insert';
      const newText = text.substring(0, info.lineEnd) + '\n' + text.substring(info.lineEnd);
      setContent(newText);
      return { mode: 'insert', content: newText, cursorPos: info.lineEnd + 1, preventDefault: true };
    }
    case 'O': {
      // Open new line above
      state.mode = 'insert';
      const newText = text.substring(0, info.lineStart) + '\n' + text.substring(info.lineStart);
      setContent(newText);
      return { mode: 'insert', content: newText, cursorPos: info.lineStart, preventDefault: true };
    }

    // Editing
    case 'x': {
      // Delete character under cursor
      if (pos < text.length) {
        const newText = text.substring(0, pos) + text.substring(pos + 1);
        setContent(newText);
        return { mode: 'normal', content: newText, cursorPos: Math.min(pos, newText.length - 1), preventDefault: true };
      }
      return { mode: 'normal', preventDefault: true };
    }
    case 'p': {
      // Paste register after cursor
      if (state.register) {
        // If the register came from dd (a full line), paste on new line below
        const newText = text.substring(0, info.lineEnd) + '\n' + state.register + text.substring(info.lineEnd);
        setContent(newText);
        return { mode: 'normal', content: newText, cursorPos: info.lineEnd + 1, preventDefault: true };
      }
      return { mode: 'normal', preventDefault: true };
    }
    case 'P': {
      // Paste register before cursor
      if (state.register) {
        const newText = text.substring(0, info.lineStart) + state.register + '\n' + text.substring(info.lineStart);
        setContent(newText);
        return { mode: 'normal', content: newText, cursorPos: info.lineStart, preventDefault: true };
      }
      return { mode: 'normal', preventDefault: true };
    }

    // Jump to end of file
    case 'G': {
      return { mode: 'normal', cursorPos: text.length, preventDefault: true };
    }

    // Undo — let the browser handle Ctrl+Z
    case 'u': {
      return { mode: 'normal', preventDefault: false };
    }

    default:
      return { mode: 'normal', preventDefault: true };
  }
}
