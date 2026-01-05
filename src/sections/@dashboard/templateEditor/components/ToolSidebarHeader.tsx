import { Box, Typography, Stack } from '@mui/material';

// ----------------------------------------------------------------------

interface ToolSidebarHeaderProps {
  title: string;
  description?: string;
}

export default function ToolSidebarHeader({ title, description }: ToolSidebarHeaderProps) {
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
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

