import { Box, Stack, Button, List, ListItem } from '@mui/material';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor, filters } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface FilterSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function FilterSidebar({ editor, activeTool, onChangeActiveTool }: FilterSidebarProps) {
  const open = activeTool === 'filter';

  const onClose = () => {
    onChangeActiveTool('select');
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
        <ToolSidebarHeader title="Filters" description="Apply filters to your image" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
          <List disablePadding>
            {filters.map((filter) => (
              <ListItem key={filter} disablePadding sx={{ mb: 0.5 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => editor?.changeImageFilter(filter)}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.5,
                    px: 2,
                    textTransform: 'none',
                  }}
                >
                  {filter}
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

