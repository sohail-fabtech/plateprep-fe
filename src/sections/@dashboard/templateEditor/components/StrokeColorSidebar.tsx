import { Box, Stack } from '@mui/material';
import { SketchPicker, ColorResult } from 'react-color';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor, STROKE_COLOR } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface StrokeColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function StrokeColorSidebar({ editor, activeTool, onChangeActiveTool }: StrokeColorSidebarProps) {
  const open = activeTool === 'stroke-color';
  const value = editor?.getActiveStrokeColor() || STROKE_COLOR;

  const onClose = () => {
    onChangeActiveTool('select');
  };

  const onChange = (color: ColorResult) => {
    editor?.changeStrokeColor(color.hex);
  };

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
        <ToolSidebarHeader title="Stroke color" description="Add stroke color to your element" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <SketchPicker color={value} onChange={onChange} disableAlpha={false} />
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

