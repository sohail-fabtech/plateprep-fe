import { Box, Stack, Button, List, ListItem } from '@mui/material';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

const FONTS = [
  'Arial',
  'Times New Roman',
  'Helvetica',
  'Georgia',
  'Verdana',
  'Courier New',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
  'Palatino',
  'Garamond',
  'Bookman',
  'Avant Garde',
  'Arial Black',
  'Tahoma',
  'Lucida Console',
];

export default function FontSidebar({ editor, activeTool, onChangeActiveTool }: FontSidebarProps) {
  const open = activeTool === 'font';
  const value = editor?.getActiveFontFamily() || 'Arial';

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
        <ToolSidebarHeader title="Font" description="Change the text font" icon="solar:text-bold" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
          <List disablePadding>
            {FONTS.map((font) => (
              <ListItem key={font} disablePadding sx={{ mb: 0.5 }}>
                <Button
                  fullWidth
                  variant={value === font ? 'contained' : 'outlined'}
                  onClick={() => editor?.changeFontFamily(font)}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 2,
                    px: 2,
                    textTransform: 'none',
                    fontFamily: font,
                    fontSize: 16,
                    border: value === font ? 2 : 1,
                    borderColor: value === font ? 'primary.main' : 'divider',
                  }}
                >
                  {font}
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

