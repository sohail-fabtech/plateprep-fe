import { useState } from 'react';
import { Box, Stack, Button, TextField, Alert } from '@mui/material';
// components
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface AiSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function AiSidebar({ editor, activeTool, onChangeActiveTool }: AiSidebarProps) {
  const open = activeTool === 'ai';
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const onClose = () => {
    onChangeActiveTool('select');
    setPrompt('');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || prompt.length < 3) return;

    setGenerating(true);
    try {
      // TODO: Integrate with actual AI image generation API
      // For now, this is a placeholder
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('AI image generation is not yet implemented. This is a placeholder.');
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setGenerating(false);
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
        <ToolSidebarHeader title="AI" description="Generate an image using AI" />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <form onSubmit={handleGenerate}>
            <Stack spacing={2}>
              <TextField
                multiline
                rows={10}
                placeholder="An astronaut riding a horse on mars, hd, dramatic lighting"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={generating}
                required
                inputProps={{ minLength: 3 }}
                fullWidth
              />

              <Button type="submit" variant="contained" fullWidth disabled={generating || prompt.length < 3}>
                {generating ? 'Generating...' : 'Generate'}
              </Button>

              <Alert severity="info">
                AI image generation requires API integration. Currently showing placeholder UI.
              </Alert>
            </Stack>
          </form>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

