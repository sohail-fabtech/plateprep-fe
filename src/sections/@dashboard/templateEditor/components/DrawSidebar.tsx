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
        <ToolSidebarHeader title="Draw" description="Draw on your canvas" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={3}>
            <Box>
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

            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Brush Color
              </Typography>
              <SketchPicker color={currentBrushColor} onChange={handleBrushColorChange} disableAlpha={false} />
            </Box>
          </Stack>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

