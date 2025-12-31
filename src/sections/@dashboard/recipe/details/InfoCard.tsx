import { Box, Typography, useTheme, alpha } from '@mui/material';
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  icon: string;
  label: string;
  value: string;
};

export default function InfoCard({ icon, label, value }: Props) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        px: 2.5,
        py: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.grey[500], 0.08),
        transition: theme.transitions.create(['background-color'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          bgcolor: alpha(theme.palette.grey[500], 0.12),
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
        <Iconify icon={icon} width={18} sx={{ color: theme.palette.text.secondary }} />
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 700,
            color: theme.palette.text.disabled,
            letterSpacing: 1.2,
            fontSize: '0.65rem',
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: '#1a2942',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

