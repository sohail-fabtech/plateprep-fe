import { Box, List, ListItemButton, Stack, Typography, Tooltip } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
// types
import { ActiveTool } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface EditorSidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

interface SidebarItem {
  tool: ActiveTool;
  icon: string;
  label: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { tool: 'templates', icon: 'eva:grid-outline', label: 'Design' },
  { tool: 'images', icon: 'eva:image-outline', label: 'Image' },
  { tool: 'text', icon: 'eva:type-outline', label: 'Text' },
  { tool: 'shapes', icon: 'eva:square-outline', label: 'Shapes' },
  { tool: 'draw', icon: 'eva:edit-outline', label: 'Draw' },
  { tool: 'ai', icon: 'eva:star-outline', label: 'AI' },
  { tool: 'settings', icon: 'eva:settings-outline', label: 'Settings' },
];

export default function EditorSidebar({ activeTool, onChangeActiveTool }: EditorSidebarProps) {
  return (
    <Box
      sx={{
        width: 100,
        height: '100%',
        bgcolor: 'background.paper',
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <List disablePadding sx={{ flex: 1 }}>
        {SIDEBAR_ITEMS.map((item) => (
          <Tooltip key={item.tool} title={item.label} placement="right">
            <ListItemButton
              onClick={() => onChangeActiveTool(item.tool)}
              selected={activeTool === item.tool}
              sx={{
                flexDirection: 'column',
                py: 2,
                px: 1.5,
                minHeight: 90,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                },
              }}
            >
              <Iconify
                icon={item.icon}
                width={24}
                sx={{
                  mb: 1,
                  color: activeTool === item.tool ? 'primary.main' : 'text.secondary',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  color: activeTool === item.tool ? 'primary.main' : 'text.secondary',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </Typography>
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
}

