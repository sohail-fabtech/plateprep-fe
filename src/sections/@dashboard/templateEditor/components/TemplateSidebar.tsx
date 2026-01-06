import { Box, Stack, Typography, Grid } from '@mui/material';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor } from '../../../../@types/editor';
// mock
import { _templateEditorList } from '../../../../_mock/arrays';

// ----------------------------------------------------------------------

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function TemplateSidebar({ editor, activeTool, onChangeActiveTool }: TemplateSidebarProps) {
  const open = activeTool === 'templates';

  const onClose = () => {
    onChangeActiveTool('select');
  };

  const onClick = (template: (typeof _templateEditorList)[0]) => {
    editor?.loadJson(template.json);
    onClose();
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
        <ToolSidebarHeader 
          title="Templates" 
          description="Choose from a variety of templates to get started"
          icon="solar:gallery-bold"
        />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Grid container spacing={2}>
            {_templateEditorList.map((template) => (
              <Grid item xs={6} key={template.id}>
                <Box
                  onClick={() => onClick(template)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: `${template.width} / ${template.height}`,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={template.thumbnailUrl}
                    alt={template.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 0.5,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'common.white',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: 10 }}>
                      {template.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

