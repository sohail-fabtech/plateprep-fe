import { useEffect, useMemo, useState } from 'react';
import { Box, Stack, TextField, Button, Typography } from '@mui/material';
import { SketchPicker, ColorResult } from 'react-color';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface SettingsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function SettingsSidebar({ editor, activeTool, onChangeActiveTool }: SettingsSidebarProps) {
  const open = activeTool === 'settings';
  const workspace = editor?.getWorkspace();

  const initialWidth = useMemo(() => `${workspace?.width ?? 0}`, [workspace]);
  const initialHeight = useMemo(() => `${workspace?.height ?? 0}`, [workspace]);
  const initialBackground = useMemo(() => (workspace?.fill as string) ?? '#ffffff', [workspace]);

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [background, setBackground] = useState(initialBackground);

  useEffect(() => {
    setWidth(initialWidth);
    setHeight(initialHeight);
    setBackground(initialBackground);
  }, [initialWidth, initialHeight, initialBackground]);

  const onClose = () => {
    onChangeActiveTool('select');
  };

  const handleBackgroundChange = (color: ColorResult) => {
    const newBackground = color.hex;
    setBackground(newBackground);
    editor?.changeBackground(newBackground);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editor?.changeSize({
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    });
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
        <ToolSidebarHeader title="Settings" description="Change the look of your workspace" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Height
                </Typography>
                <TextField
                  placeholder="Height"
                  value={height}
                  type="number"
                  onChange={(e) => setHeight(e.target.value)}
                  fullWidth
                  inputProps={{ min: 100, max: 5000 }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Width
                </Typography>
                <TextField
                  placeholder="Width"
                  value={width}
                  type="number"
                  onChange={(e) => setWidth(e.target.value)}
                  fullWidth
                  inputProps={{ min: 100, max: 5000 }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Background Color
                </Typography>
                <SketchPicker color={background} onChange={handleBackgroundChange} disableAlpha={false} />
              </Box>

              <Button type="submit" variant="contained" fullWidth>
                Apply Changes
              </Button>
            </Stack>
          </form>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

