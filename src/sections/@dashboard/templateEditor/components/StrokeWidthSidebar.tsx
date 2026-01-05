import { Box, Stack, Slider, Typography, Button } from '@mui/material';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor, STROKE_WIDTH, STROKE_DASH_ARRAY } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface StrokeWidthSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function StrokeWidthSidebar({ editor, activeTool, onChangeActiveTool }: StrokeWidthSidebarProps) {
  const open = activeTool === 'stroke-width';
  const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH;
  const typeValue = editor?.getActiveStrokeDashArray() || STROKE_DASH_ARRAY;

  const onClose = () => {
    onChangeActiveTool('select');
  };

  const onChangeStrokeWidth = (_: Event, newValue: number | number[]) => {
    editor?.changeStrokeWidth(newValue as number);
  };

  const onChangeStrokeType = (value: number[]) => {
    editor?.changeStrokeDashArray(value);
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
        <ToolSidebarHeader title="Stroke width" description="Change the stroke width of your element" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Box sx={{ mb: 3, pb: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Stroke width
            </Typography>
            <Slider
              value={widthValue}
              onChange={onChangeStrokeWidth}
              min={1}
              max={50}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Stroke type
            </Typography>
            <Stack spacing={1}>
              <Button
                fullWidth
                variant={JSON.stringify(typeValue) === '[]' ? 'contained' : 'outlined'}
                onClick={() => onChangeStrokeType([])}
                sx={{
                  justifyContent: 'flex-start',
                  py: 2,
                  px: 2,
                  textTransform: 'none',
                  border: JSON.stringify(typeValue) === '[]' ? 2 : 1,
                  borderColor: JSON.stringify(typeValue) === '[]' ? 'primary.main' : 'divider',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 4,
                    borderTop: (theme) => `4px solid ${theme.palette.text.primary}`,
                    borderRadius: 1,
                  }}
                />
              </Button>
              <Button
                fullWidth
                variant={JSON.stringify(typeValue) === '[5,5]' ? 'contained' : 'outlined'}
                onClick={() => onChangeStrokeType([5, 5])}
                sx={{
                  justifyContent: 'flex-start',
                  py: 2,
                  px: 2,
                  textTransform: 'none',
                  border: JSON.stringify(typeValue) === '[5,5]' ? 2 : 1,
                  borderColor: JSON.stringify(typeValue) === '[5,5]' ? 'primary.main' : 'divider',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 4,
                    borderTop: (theme) => `4px dashed ${theme.palette.text.primary}`,
                    borderRadius: 1,
                  }}
                />
              </Button>
            </Stack>
          </Box>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

