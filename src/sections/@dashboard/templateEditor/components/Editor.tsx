import { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
// @mui
import { Box, Stack } from '@mui/material';
import { useSnackbar } from '../../../../components/snackbar';
// types
import { ActiveTool, selectionDependentTools, EditorHookProps, JSON_KEYS } from '../../../../@types/editor';
// hooks
import { useEditor } from '../hooks/useEditor';
// services
import { exportCanvasAndUploadToS3, exportCanvasWithPayload } from '../../../../services/templateEditor/canvasExportService';
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
  const { enqueueSnackbar } = useSnackbar();
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [isFirstSave, setIsFirstSave] = useState(true);

  // Enhanced save callback - now exports and uploads to S3 on first save
  const saveCallback = useCallback(
    async (values: {
      json: string;
      height: number;
      width: number;
      dataUrl?: string;
    }) => {
      try {
        const parsed = JSON.parse(values.json);

        // On first save, automatically export and upload to S3
        if (isFirstSave) {
          console.log('🎯 First save detected - exporting and uploading to S3...');
          setIsFirstSave(false);

          // Get canvas from global reference
          const canvas = (window as any).__FABRIC_CANVAS__;
          if (!canvas) {
            throw new Error('Canvas not initialized');
          }

          try {
            const result = await exportCanvasAndUploadToS3(canvas, {
              title: 'Untitled Design',
              format: 'png',
              quality: 1,
              multiplier: 2,
            });

            if (result.success) {
              const payload = {
                title: 'Untitled Design',
                image: result.imageUrl, // S3 URL
                imageFile: result.imageFile,
                source: parsed,
                metadata: {
                  width: values.width,
                  height: values.height,
                  uploadedAt: result.timestamp,
                },
              };

              console.log('✅ Template exported and uploaded to S3:', payload);
              enqueueSnackbar('Design saved and uploaded to S3!', {
                variant: 'success',
              });
            } else {
              throw new Error(result.error || 'Upload failed');
            }
          } catch (uploadError) {
            console.error('❌ S3 upload failed:', uploadError);
            enqueueSnackbar('Failed to upload design to S3', {
              variant: 'error',
            });

            // Fallback: use dataUrl for the image
            const fallbackPayload = {
              title: 'Untitled Design',
              image: values.dataUrl, // Fallback to dataUrl
              source: parsed,
              metadata: {
                width: values.width,
                height: values.height,
              },
            };
            console.log('⚠️ Falling back to local dataUrl:', fallbackPayload);
            enqueueSnackbar('Using local preview (S3 upload failed)', {
              variant: 'warning',
            });
          }
        } else if (!isFirstSave) {
          // Subsequent saves: just log the payload (debounced in useHistory)
          const payload = {
            title: 'Untitled Design',
            image: values.dataUrl,
            source: parsed,
            metadata: {
              width: values.width,
              height: values.height,
            },
          };
          console.log('💾 Template autosave payload:', payload);
        }
      } catch (error) {
        console.error('Failed to build save payload', error);
        enqueueSnackbar('Error saving design', { variant: 'error' });
      }
    },
    [isFirstSave, enqueueSnackbar]
  );

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

  const containerRef = useRef<HTMLDivElement>(null);
  const htmlCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!htmlCanvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(htmlCanvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    // Store canvas reference globally for export operations
    (window as any).__FABRIC_CANVAS__ = canvas;

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
            <canvas ref={htmlCanvasRef} />
          </Box>

          {/* Footer */}
          <EditorFooter editor={editor} />
        </Stack>
      </Box>
    </Box>
  );
}

