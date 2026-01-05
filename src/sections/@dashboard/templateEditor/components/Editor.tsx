import { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
// @mui
import { Box, Stack } from '@mui/material';
// types
import { ActiveTool, selectionDependentTools, EditorHookProps } from '../../../../@types/editor';
// hooks
import { useEditor } from '../hooks/useEditor';
// components
import EditorNavbar from './EditorNavbar';
import EditorSidebar from './EditorSidebar';
import EditorFooter from './EditorFooter';
import EditorToolbar from './EditorToolbar';
import TemplateSidebar from './TemplateSidebar';
import TextSidebar from './TextSidebar';
import ShapeSidebar from './ShapeSidebar';
import ImageSidebar from './ImageSidebar';
import FillColorSidebar from './FillColorSidebar';
import StrokeColorSidebar from './StrokeColorSidebar';
import StrokeWidthSidebar from './StrokeWidthSidebar';
import OpacitySidebar from './OpacitySidebar';
import FontSidebar from './FontSidebar';
import FilterSidebar from './FilterSidebar';
import DrawSidebar from './DrawSidebar';
import AiSidebar from './AiSidebar';
import RemoveBgSidebar from './RemoveBgSidebar';
import SettingsSidebar from './SettingsSidebar';

// ----------------------------------------------------------------------

interface EditorProps {
  id?: string;
  defaultState?: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export default function Editor({
  id,
  defaultState,
  defaultWidth = 1920,
  defaultHeight = 1080,
}: EditorProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');

  // Mock save callback - in real app, this would save to API
  const saveCallback = useCallback((values: { json: string; height: number; width: number }) => {
    // Just log for now - can be replaced with API call later
    console.log('Editor save:', values);
  }, []);

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool('select');
    }
  }, [activeTool]);

  const editorHookProps: EditorHookProps = {
    defaultState,
    defaultWidth,
    defaultHeight,
    clearSelectionCallback: onClearSelection,
    saveCallback,
  };

  const { init, editor } = useEditor(editorHookProps);

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === 'draw') {
        editor?.enableDrawingMode();
      }

      if (activeTool === 'draw') {
        editor?.disableDrawingMode();
      }

      if (tool === activeTool) {
        return setActiveTool('select');
      }

      setActiveTool(tool);
    },
    [activeTool, editor]
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Navbar */}
      <EditorNavbar
        id={id || 'editor'}
        editor={editor}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
      />

      {/* Main content area */}
      <Box
        sx={{
          position: 'absolute',
          top: 68,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {/* Sidebar */}
        <EditorSidebar activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />

        {/* Tool sidebars - conditionally rendered based on activeTool */}
        <TemplateSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <ImageSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <TextSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <ShapeSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <FillColorSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <StrokeColorSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <StrokeWidthSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <OpacitySidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <FontSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <FilterSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <DrawSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <AiSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <RemoveBgSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <SettingsSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />

        {/* Canvas area */}
        <Stack
          flexGrow={1}
          sx={{
            bgcolor: 'grey.100',
            overflow: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Toolbar */}
          <EditorToolbar
            key={editor?.selectedObjects.length || 0}
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />

          {/* Canvas container */}
          <Box
            ref={containerRef}
            sx={{
              flexGrow: 1,
              height: 'calc(100% - 124px)', // 56px toolbar + 52px footer = 108px, but leaving 124px for now
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <canvas ref={canvasRef} />
          </Box>

          {/* Footer */}
          <EditorFooter editor={editor} />
        </Stack>
      </Box>
    </Box>
  );
}

