import { useState } from 'react';
import { Box, Stack, Button, CircularProgress, Alert, Typography } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface RemoveBgSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function RemoveBgSidebar({ editor, activeTool, onChangeActiveTool }: RemoveBgSidebarProps) {
  const open = activeTool === 'remove-bg';
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClose = () => {
    onChangeActiveTool('select');
  };

  const handleRemoveBackground = async () => {
    const selectedObject = editor?.selectedObjects[0];
    if (!selectedObject || selectedObject.type !== 'image') {
      setError('Please select an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // TODO: Integrate with actual remove background API
      // For now, this is a placeholder
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setError('Remove background feature is not yet implemented. This is a placeholder.');
    } catch (err) {
      console.error('Remove background error:', err);
      setError('Failed to remove background. Please try again.');
    } finally {
      setProcessing(false);
    }
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
        <ToolSidebarHeader title="Remove Background" description="Remove the background from your image" icon="material-symbols:background-replace-rounded" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Select an image on the canvas and click the button below to remove its background.
            </Typography>

            {error && (
              <Alert severity={error.includes('not yet implemented') ? 'info' : 'error'}>{error}</Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleRemoveBackground}
              disabled={processing || !editor?.selectedObjects.length}
              startIcon={processing ? <CircularProgress size={16} /> : <Iconify icon="material-symbols:background-replace-rounded" />}
            >
              {processing ? 'Processing...' : 'Remove Background'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Note: This feature requires API integration. Currently showing placeholder UI.
            </Typography>
          </Stack>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

