import { useState, useRef } from 'react';
// @mui
import {
  AppBar,
  Toolbar,
  Box,
  Stack,
  Button,
  IconButton,
  Divider,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
// types
import { ActiveTool, Editor } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface EditorNavbarProps {
  id?: string;
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function EditorNavbar({
  id = 'editor',
  editor,
  activeTool,
  onChangeActiveTool,
}: EditorNavbarProps) {
  const [fileMenuOpen, setFileMenuOpen] = useState<HTMLElement | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState<HTMLElement | null>(null);
  const fileMenuRef = useRef<HTMLElement>(null);
  const exportMenuRef = useRef<HTMLElement>(null);

  // Mock save status - in real app, this would come from API/mutation state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');

  const handleOpenFilePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = () => {
          editor?.loadJson(reader.result as string);
        };
      }
    };
    input.click();
    setFileMenuOpen(null);
  };

  const handleExport = (type: 'json' | 'png' | 'jpg' | 'svg') => {
    switch (type) {
      case 'json':
        editor?.saveJson();
        break;
      case 'png':
        editor?.savePng();
        break;
      case 'jpg':
        editor?.saveJpg();
        break;
      case 'svg':
        editor?.saveSvg();
        break;
    }
    setExportMenuOpen(null);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        height: 68,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          minHeight: '68px !important',
          px: { xs: 2, md: 4 },
          gap: 2,
        }}
      >
        {/* Logo placeholder - can be replaced with actual logo */}
        <Typography variant="h6" sx={{ mr: 2 }}>
          Template Editor
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
          {/* File Menu */}
          <Button
            variant="text"
            size="small"
            onClick={(e) => setFileMenuOpen(e.currentTarget)}
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} />}
            sx={{
              color: 'text.primary',
              textTransform: 'none',
            }}
          >
            File
          </Button>

          <MenuPopover
            open={fileMenuOpen}
            onClose={() => setFileMenuOpen(null)}
            anchorEl={fileMenuOpen}
            arrow="top-left"
            sx={{ width: 240 }}
          >
            <MenuItem
              onClick={handleOpenFilePicker}
              sx={{
                py: 1.5,
                px: 2,
              }}
            >
              <Iconify icon="eva:file-outline" width={24} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2">Open</Typography>
                <Typography variant="caption" color="text.secondary">
                  Open a JSON file
                </Typography>
              </Box>
            </MenuItem>
          </MenuPopover>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Select Tool */}
          <IconButton
            size="small"
            onClick={() => onChangeActiveTool('select')}
            color={activeTool === 'select' ? 'primary' : 'default'}
            sx={{
              bgcolor: activeTool === 'select' ? 'action.selected' : 'transparent',
            }}
          >
            <Iconify icon="eva:move-outline" width={20} />
          </IconButton>

          {/* Undo */}
          <IconButton
            size="small"
            onClick={() => editor?.onUndo()}
            disabled={!editor?.canUndo()}
            color="default"
          >
            <Iconify icon="eva:undo-outline" width={20} />
          </IconButton>

          {/* Redo */}
          <IconButton
            size="small"
            onClick={() => editor?.onRedo()}
            disabled={!editor?.canRedo()}
            color="default"
          >
            <Iconify icon="eva:redo-outline" width={20} />
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Save Status */}
          {saveStatus === 'saving' && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Saving...
              </Typography>
            </Stack>
          )}
          {saveStatus === 'error' && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="eva:cloud-upload-fill" width={20} sx={{ color: 'error.main' }} />
              <Typography variant="caption" color="error">
                Failed to save
              </Typography>
            </Stack>
          )}
          {saveStatus === 'saved' && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="eva:checkmark-circle-2-fill" width={20} sx={{ color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">
                Saved
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Right side - Export and User */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Export Menu */}
          <Button
            variant="text"
            size="small"
            onClick={(e) => setExportMenuOpen(e.currentTarget)}
            endIcon={<Iconify icon="eva:download-outline" width={16} />}
            sx={{
              color: 'text.primary',
              textTransform: 'none',
            }}
          >
            Export
          </Button>

          <MenuPopover
            open={exportMenuOpen}
            onClose={() => setExportMenuOpen(null)}
            anchorEl={exportMenuOpen}
            arrow="top-right"
            sx={{ width: 240 }}
          >
            <MenuItem
              onClick={() => handleExport('json')}
              sx={{
                py: 1.5,
                px: 2,
              }}
            >
              <Iconify icon="eva:file-text-outline" width={24} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2">JSON</Typography>
                <Typography variant="caption" color="text.secondary">
                  Save for later editing
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem
              onClick={() => handleExport('png')}
              sx={{
                py: 1.5,
                px: 2,
              }}
            >
              <Iconify icon="eva:image-outline" width={24} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2">PNG</Typography>
                <Typography variant="caption" color="text.secondary">
                  Best for sharing on the web
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem
              onClick={() => handleExport('jpg')}
              sx={{
                py: 1.5,
                px: 2,
              }}
            >
              <Iconify icon="eva:image-outline" width={24} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2">JPG</Typography>
                <Typography variant="caption" color="text.secondary">
                  Best for printing
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem
              onClick={() => handleExport('svg')}
              sx={{
                py: 1.5,
                px: 2,
              }}
            >
              <Iconify icon="eva:image-outline" width={24} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2">SVG</Typography>
                <Typography variant="caption" color="text.secondary">
                  Best for editing in vector software
                </Typography>
              </Box>
            </MenuItem>
          </MenuPopover>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

