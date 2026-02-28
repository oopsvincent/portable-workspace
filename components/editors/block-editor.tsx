'use client';

import React, { useMemo, useCallback } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useTheme } from 'next-themes';

interface BlockEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export default function BlockEditor({ content, onContentChange }: BlockEditorProps) {
  const { theme } = useTheme();

  // Create the BlockNote editor with initial markdown content
  const editor = useCreateBlockNote({
    initialContent: undefined, // Will be set via markdown below
  });

  // Load initial content from markdown
  const initialized = React.useRef(false);
  React.useEffect(() => {
    if (!initialized.current && editor && content) {
      initialized.current = true;
      (async () => {
        try {
          const blocks = await editor.tryParseMarkdownToBlocks(content);
          editor.replaceBlocks(editor.document, blocks);
        } catch (e) {
          console.warn('Failed to parse markdown:', e);
        }
      })();
    }
  }, [editor, content]);

  // Handle content changes — convert blocks back to markdown
  const handleChange = useCallback(async () => {
    if (!editor) return;
    try {
      const md = await editor.blocksToMarkdownLossy(editor.document);
      onContentChange(md);
    } catch (e) {
      console.warn('Failed to convert to markdown:', e);
    }
  }, [editor, onContentChange]);

  return (
    <div className="block-editor-wrapper h-full overflow-auto">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme={theme === 'dark' ? 'dark' : 'light'}
        data-theming-css-variables-demo
      />
    </div>
  );
}
