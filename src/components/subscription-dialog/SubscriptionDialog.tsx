import { Dialog, DialogContent, DialogActions, Box, Typography, Button, IconButton, useTheme, alpha } from '@mui/material';
import Iconify from '../iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  message?: string;
  buttonText?: string;
  onClose?: () => void;
  onButtonClick?: () => void;
};

export default function SubscriptionDialog({
  open,
  message = 'You need an active subscription to access this feature. Please subscribe to continue.',
  buttonText = 'Subscribe Now',
  onClose,
  onButtonClick,
}: Props) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 0,
        },
      }}
    >
      <DialogContent
        sx={{
          p: 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.warning.main, 0.16),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="eva:credit-card-outline" width={40} sx={{ color: theme.palette.warning.main }} />
        </Box>

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main }}>
            Subscription Required
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {message}
          </Typography>
        </Box>

        {onClose && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'text.secondary',
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[500], 0.08),
              },
            }}
          >
            <Iconify icon="eva:close-fill" width={20} />
          </IconButton>
        )}
      </DialogContent>

      {onButtonClick && (
        <DialogActions sx={{ px: 4, pb: 3, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={onButtonClick}
            sx={{
              minWidth: 140,
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              fontWeight: 600,
              height: { xs: 40, md: 44 },
            }}
          >
            {buttonText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

