import { Dialog, DialogContent, Box, Typography, CircularProgress, IconButton, useTheme, alpha } from '@mui/material';
import Iconify from '../iconify';

// ----------------------------------------------------------------------

type ProcessingState = 'processing' | 'success' | 'error';

type Props = {
  open: boolean;
  state: ProcessingState;
  message?: string;
  onClose?: () => void;
};

export default function ProcessingDialog({ open, state, message, onClose }: Props) {
  const theme = useTheme();

  const getContent = () => {
    switch (state) {
      case 'processing':
        return {
          icon: <CircularProgress size={64} sx={{ color: theme.palette.primary.main }} />,
          title: 'Processing...',
          description: message || 'Please wait while we process your request.',
          color: theme.palette.primary.main,
        };
      case 'success':
        return {
          icon: (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.16),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="eva:checkmark-circle-2-fill" width={40} sx={{ color: theme.palette.success.main }} />
            </Box>
          ),
          title: 'Success!',
          description: message || 'Your request has been processed successfully.',
          color: theme.palette.success.main,
        };
      case 'error':
        return {
          icon: (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.error.main, 0.16),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="eva:close-circle-fill" width={40} sx={{ color: theme.palette.error.main }} />
            </Box>
          ),
          title: 'Error',
          description: message || 'The process could not be completed. Please try again.',
          color: theme.palette.error.main,
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <Dialog
      open={open}
      onClose={state === 'processing' ? undefined : onClose}
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
        {content.icon}

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: content.color }}>
            {content.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {content.description}
          </Typography>
        </Box>

        {state !== 'processing' && onClose && (
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
    </Dialog>
  );
}

