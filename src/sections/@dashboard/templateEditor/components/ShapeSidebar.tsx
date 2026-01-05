import { Box, Stack, IconButton, Tooltip, Grid } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface ShapeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function ShapeSidebar({ editor, activeTool, onChangeActiveTool }: ShapeSidebarProps) {
  const open = activeTool === 'shapes';

  const onClose = () => {
    onChangeActiveTool('select');
  };

  const shapes = [
    { icon: 'solar:circle-bold', label: 'Circle', onClick: () => editor?.addCircle() },
    { icon: 'solar:square-bold', label: 'Rounded Square', onClick: () => editor?.addSoftRectangle() },
    { icon: 'solar:square-academic-bold', label: 'Square', onClick: () => editor?.addRectangle() },
    { icon: 'solar:triangle-bold', label: 'Triangle', onClick: () => editor?.addTriangle() },
    {
      icon: 'solar:triangle-bold',
      label: 'Inverse Triangle',
      onClick: () => editor?.addInverseTriangle(),
      sx: { transform: 'rotate(180deg)' },
    },
    { icon: 'solar:diamond-bold', label: 'Diamond', onClick: () => editor?.addDiamond() },
  ];

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
        <ToolSidebarHeader title="Shapes" description="Add shapes to your canvas" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Grid container spacing={2}>
            {shapes.map((shape, index) => (
              <Grid item xs={4} key={index}>
                <Tooltip title={shape.label}>
                  <IconButton
                    onClick={shape.onClick}
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      ...shape.sx,
                    }}
                  >
                    <Iconify icon={shape.icon} width={32} />
                  </IconButton>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

