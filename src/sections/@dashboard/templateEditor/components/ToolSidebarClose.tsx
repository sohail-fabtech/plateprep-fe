import { IconButton, Box, useTheme, alpha } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

interface ToolSidebarCloseProps {
  onClick: () => void;
}

export default function ToolSidebarClose({ onClick }: ToolSidebarCloseProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'absolute',
        right: -28,
        top: '50%',
        transform: 'translateY(-50%)',
        height: 70,
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          display: 'flex',
          borderRadius: 1,
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          color: 'primary.main',
        }}
      >
        <Iconify icon="eva:arrow-ios-back-outline" width={16} />
      </Box>
    </Box>
  );
}

