import { Box, Stack, Slider, Typography } from '@mui/material';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface OpacitySidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function OpacitySidebar({ editor, activeTool, onChangeActiveTool }: OpacitySidebarProps) {
  const open = activeTool === 'opacity';
  const value = editor?.getActiveOpacity() || 1;

  const onClose = () => {
    onChangeActiveTool('select');
  };

  const onChange = (_: Event, newValue: number | number[]) => {
    editor?.changeOpacity((newValue as number) / 100);
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
        <ToolSidebarHeader title="Opacity" description="Change the opacity of your element" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Opacity: {Math.round(value * 100)}%
          </Typography>
          <Slider
            value={value * 100}
            onChange={onChange}
            min={0}
            max={100}
            step={1}
            marks={[
              { value: 0, label: '0%' },
              { value: 50, label: '50%' },
              { value: 100, label: '100%' },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => `${val}%`}
          />
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

