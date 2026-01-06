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
    { 
      shape: <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'text.primary' }} />,
      label: 'Circle', 
      onClick: () => editor?.addCircle() 
    },
    { 
      shape: <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'text.primary' }} />,
      label: 'Rounded Square', 
      onClick: () => editor?.addSoftRectangle() 
    },
    { 
      shape: <Box sx={{ width: 40, height: 40, bgcolor: 'text.primary' }} />,
      label: 'Square', 
      onClick: () => editor?.addRectangle() 
    },
    { 
      shape: <Box sx={{ width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: (theme) => `35px solid ${theme.palette.text.primary}` }} />,
      label: 'Triangle', 
      onClick: () => editor?.addTriangle() 
    },
    {
      shape: <Box sx={{ width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: (theme) => `35px solid ${theme.palette.text.primary}` }} />,
      label: 'Inverse Triangle',
      onClick: () => editor?.addInverseTriangle(),
    },
    { 
      shape: <Box sx={{ width: 40, height: 40, transform: 'rotate(45deg)', bgcolor: 'text.primary' }} />,
      label: 'Diamond', 
      onClick: () => editor?.addDiamond() 
    },
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
        <ToolSidebarHeader title="Shapes" description="Add shapes to your canvas" icon="material-symbols:shapes" />

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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {shape.shape}
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

