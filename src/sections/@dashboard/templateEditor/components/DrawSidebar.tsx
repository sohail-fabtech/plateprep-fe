import { Box, Stack, Slider, Typography } from '@mui/material';
import { SketchPicker, ColorResult } from 'react-color';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor, STROKE_WIDTH, STROKE_COLOR } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface DrawSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function DrawSidebar({ editor, activeTool, onChangeActiveTool }: DrawSidebarProps) {
  const open = activeTool === 'draw';

  const onClose = () => {
    onChangeActiveTool('select');
  };

  const handleBrushSizeChange = (_: Event, newValue: number | number[]) => {
    if (!editor?.canvas) return;
    editor.canvas.freeDrawingBrush.width = newValue as number;
    editor.changeStrokeWidth(newValue as number);
  };

  const handleBrushColorChange = (color: ColorResult) => {
    if (!editor?.canvas) return;
    editor.canvas.freeDrawingBrush.color = color.hex;
    editor.changeStrokeColor(color.hex);
  };

  const currentBrushWidth = editor?.canvas?.freeDrawingBrush?.width || STROKE_WIDTH;
  const currentBrushColor = editor?.canvas?.freeDrawingBrush?.color || STROKE_COLOR;

  return (
    <Box
      sx={{
        position: 'relative',
        width: open ? 360 : 0,
        height: '100%',
        bgcolor: 'background.paper',
        borderRight: (theme) => open ? `1px solid ${theme.palette.divider}` : 'none',
        zIndex: (theme) => theme.zIndex.drawer - 1,
        overflow: 'hidden',
        transition: (theme) => theme.transitions.create('width'),
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
      }}
    >
      <Stack sx={{ height: '100%', width: 360 }}>
        <ToolSidebarHeader title="Draw" description="Draw on your canvas" icon="solar:pen-bold" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, width: '100%', boxSizing: 'border-box' }}>
          <Stack spacing={3} sx={{ width: '100%' }}>
            <Box sx={{ width: '100%', overflow: 'hidden' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Brush Size: {currentBrushWidth}px
              </Typography>
              <Slider
                value={currentBrushWidth}
                onChange={handleBrushSizeChange}
                min={1}
                max={50}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ width: '100%', overflow: 'hidden' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Brush Color
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  overflow: 'hidden',
                  '& .sketch-picker': {
                    width: '100% !important',
                    boxShadow: 'none !important',
                    border: (theme) => `1px solid ${theme.palette.divider} !important`,
                    borderRadius: '8px !important',
                    background: (theme) => `${theme.palette.background.paper} !important`,
                    padding: '16px !important',
                    boxSizing: 'border-box !important',
                  },
                  '& .sketch-picker > div:first-of-type > div:first-of-type': {
                    borderRadius: '4px !important',
                  },
                  '& .sketch-picker input': {
                    background: (theme) => `${theme.palette.background.default} !important`,
                    border: (theme) => `1px solid ${theme.palette.divider} !important`,
                    borderRadius: '4px !important',
                    color: (theme) => `${theme.palette.text.primary} !important`,
                    fontSize: '14px !important',
                    width: '100% !important',
                  },
                  '& .sketch-picker label': {
                    color: (theme) => `${theme.palette.text.secondary} !important`,
                    fontSize: '12px !important',
                  },
                  '& .flexbox-fix': {
                    width: '100% !important',
                  },
                }}
              >
                <SketchPicker 
                  color={currentBrushColor} 
                  onChange={handleBrushColorChange} 
                  disableAlpha={false}
                  width="100%"
                />
              </Box>
            </Box>
          </Stack>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

