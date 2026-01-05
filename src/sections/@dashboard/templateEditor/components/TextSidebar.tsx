import { Box, Stack, Button } from '@mui/material';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface TextSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function TextSidebar({ editor, activeTool, onChangeActiveTool }: TextSidebarProps) {
  const open = activeTool === 'text';

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
        <ToolSidebarHeader title="Text" description="Add text to your canvas" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => editor?.addText('Textbox')}
              sx={{ py: 1.5 }}
            >
              Add a textbox
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() =>
                editor?.addText('Heading', {
                  fontSize: 80,
                  fontWeight: 700,
                })
              }
              sx={{
                py: 3,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              Add a heading
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() =>
                editor?.addText('Subheading', {
                  fontSize: 44,
                  fontWeight: 600,
                })
              }
              sx={{
                py: 2,
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              Add a subheading
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() =>
                editor?.addText('Paragraph', {
                  fontSize: 32,
                })
              }
              sx={{
                py: 2,
              }}
            >
              Paragraph
            </Button>
          </Stack>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

