import { Dialog, DialogContent, DialogActions, Box, Typography, Button, IconButton, useTheme, alpha, Stack } from '@mui/material';
import Iconify from '../iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onRecipeTemplateClick: () => void;
  onManualTemplateClick: () => void;
};

export default function TemplateCreationDialog({
  open,
  onClose,
  onRecipeTemplateClick,
  onManualTemplateClick,
}: Props) {
  const theme = useTheme();

  const handleRecipeTemplateClick = () => {
    onClose();
    onRecipeTemplateClick();
  };

  const handleManualTemplateClick = () => {
    onClose();
    onManualTemplateClick();
  };

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
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
        }}
      >
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

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            }}
          >
            Create New Template
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          >
            Choose your creation method
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Iconify icon="eva:file-text-outline" width={20} />}
            onClick={handleRecipeTemplateClick}
            sx={{
              py: 1.5,
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              fontWeight: 600,
              height: { xs: 48, md: 52 },
            }}
          >
            Recipe&apos;s Template
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Iconify icon="eva:edit-2-outline" width={20} />}
            onClick={handleManualTemplateClick}
            sx={{
              py: 1.5,
              borderColor: theme.palette.info.main,
              color: theme.palette.info.main,
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              fontWeight: 600,
              height: { xs: 48, md: 52 },
              '&:hover': {
                borderColor: theme.palette.info.dark,
                bgcolor: alpha(theme.palette.info.main, 0.08),
              },
            }}
          >
            Manual Template
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: 3, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{
            minWidth: 120,
            fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            fontWeight: 600,
            height: { xs: 40, md: 44 },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

