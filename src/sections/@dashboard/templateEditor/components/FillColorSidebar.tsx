import { Box, Stack } from '@mui/material';
import { SketchPicker, ColorResult } from 'react-color';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor, FILL_COLOR } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface FillColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function FillColorSidebar({ editor, activeTool, onChangeActiveTool }: FillColorSidebarProps) {
  const open = activeTool === 'fill';
  const value = editor?.getActiveFillColor() || FILL_COLOR;

  const onClose = () => {
    onChangeActiveTool('select');
  };

  const onChange = (color: ColorResult) => {
    editor?.changeFillColor(color.hex);
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
        <ToolSidebarHeader title="Fill color" description="Add fill color to your element" icon="material-symbols:palette" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, width: '100%', boxSizing: 'border-box' }}>
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
              color={value} 
              onChange={onChange} 
              disableAlpha={false} 
              width="100%" 
            />
          </Box>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

