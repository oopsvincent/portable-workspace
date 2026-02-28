'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface CanvasEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

interface ExcalidrawElement {
  id: string;
  type: string;
  [key: string]: unknown;
}

interface AppState {
  theme?: string;
  [key: string]: unknown;
}

interface ExcalidrawData {
  elements: ExcalidrawElement[];
  appState?: AppState;
  files?: Record<string, unknown>;
}

export default function CanvasEditor({ content, onContentChange }: CanvasEditorProps) {
  const { theme } = useTheme();
  const [ExcalidrawComp, setExcalidrawComp] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamically import Excalidraw
  useEffect(() => {
    import('@excalidraw/excalidraw').then((mod) => {
      setExcalidrawComp(() => mod.Excalidraw);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load Excalidraw:', err);
      setLoading(false);
    });
  }, []);

  // Delay mount to let layout settle
  useEffect(() => {
    if (!loading && ExcalidrawComp) {
      const t = setTimeout(() => setReady(true), 150);
      return () => clearTimeout(t);
    }
  }, [loading, ExcalidrawComp]);

  // Parse initial data
  const initialData = React.useMemo((): ExcalidrawData => {
    if (!content || content.trim() === '') {
      return { elements: [], appState: { theme: theme === 'dark' ? 'dark' : 'light' } };
    }
    try {
      const parsed = JSON.parse(content);
      return {
        elements: parsed.elements || [],
        appState: { ...parsed.appState, theme: theme === 'dark' ? 'dark' : 'light' },
        files: parsed.files || {},
      };
    } catch {
      return { elements: [], appState: { theme: theme === 'dark' ? 'dark' : 'light' } };
    }
  }, []);

  // Handle changes with debounce
  const handleChange = useCallback((elements: readonly ExcalidrawElement[], appState: AppState) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const data: ExcalidrawData = {
        elements: elements as ExcalidrawElement[],
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          gridSize: appState.gridSize,
        },
      };
      onContentChange(JSON.stringify(data, null, 2));
    }, 500);
  }, [onContentChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  if (!ready || !ExcalidrawComp) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ExcalidrawComp
        initialData={initialData}
        onChange={handleChange}
        theme={theme === 'dark' ? 'dark' : 'light'}
        UIOptions={{
          canvasActions: {
            export: false,
            loadScene: false,
            saveToActiveFile: false,
          },
        }}
      />
    </div>
  );
}
