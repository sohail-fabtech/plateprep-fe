import { Box, List, ListItemButton, Stack, Typography, Tooltip, useTheme, alpha } from '@mui/material';
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
  { tool: 'templates', icon: 'material-symbols:dashboard-rounded', label: 'Design' },
  { tool: 'images', icon: 'material-symbols:image', label: 'Image' },
  { tool: 'text', icon: 'material-symbols:text-fields-rounded', label: 'Text' },
  { tool: 'shapes', icon: 'material-symbols:shapes', label: 'Shapes' },
  { tool: 'draw', icon: 'material-symbols:draw-rounded', label: 'Draw' },
  // { tool: 'ai', icon: 'material-symbols:kid-star', label: 'AI' },
  { tool: 'settings', icon: 'material-symbols:settings-alert-rounded', label: 'Settings' },
];

export default function EditorSidebar({ activeTool, onChangeActiveTool }: EditorSidebarProps) {
  const theme = useTheme();
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
              <Box
                sx={{
                  mb: 1,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  borderRadius: 1.5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: theme.transitions.create(['background-color', 'color']),
                  bgcolor: activeTool === item.tool ? alpha(theme.palette.primary.main, 0.16) : 'transparent',
                  color: activeTool === item.tool ? 'primary.main' : 'text.secondary',
                }}
              >
                <Iconify icon={item.icon} width={24} />
              </Box>
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

