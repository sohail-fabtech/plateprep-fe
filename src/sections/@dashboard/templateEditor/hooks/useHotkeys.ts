import { fabric } from 'fabric';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

interface UseHotkeysProps {
  undo: () => void;
  redo: () => void;
  copy: () => void;
  paste: () => void;
  save: () => void;
  canvas: fabric.Canvas | null;
}

export const useHotkeys = ({
  undo,
  redo,
  copy,
  paste,
  save,
  canvas,
}: UseHotkeysProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      if (!ctrlKey) return;

      switch (event.key) {
        case 'z':
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          event.preventDefault();
          redo();
          break;
        case 'c':
          event.preventDefault();
          copy();
          break;
        case 'v':
          event.preventDefault();
          paste();
          break;
        case 's':
          event.preventDefault();
          save();
          break;
        default:
          break;
      }
    };

    if (canvas) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, copy, paste, save, canvas]);
};

