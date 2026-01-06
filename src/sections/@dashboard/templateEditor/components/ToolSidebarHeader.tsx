import { Box, Typography, Stack, useTheme, alpha } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

interface ToolSidebarHeaderProps {
  title: string;
  description?: string;
  icon?: string;
}

export default function ToolSidebarHeader({ title, description, icon }: ToolSidebarHeaderProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        height: 68,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: description ? 0.5 : 0 }}>
        {icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
            }}
          >
            <Iconify icon={icon} width={18} />
          </Box>
        )}
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Stack>
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

