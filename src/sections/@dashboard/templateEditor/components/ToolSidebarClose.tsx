import { IconButton, Box } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

interface ToolSidebarCloseProps {
  onClick: () => void;
}

export default function ToolSidebarClose({ onClick }: ToolSidebarCloseProps) {
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
      <Iconify icon="eva:arrow-ios-back-outline" width={16} />
    </Box>
  );
}

