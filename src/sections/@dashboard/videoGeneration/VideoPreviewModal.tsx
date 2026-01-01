import { useState, useEffect } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
// @types
import { IVideoGeneration } from '../../../@types/videoGeneration';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  video: IVideoGeneration | null;
  onClose: VoidFunction;
};

export default function VideoPreviewModal({ open, video, onClose }: Props) {
  const theme = useTheme();
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (open && videoRef) {
      videoRef.load();
    }
  }, [open, videoRef]);

  if (!video) return null;

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          pb: { xs: 1.5, sm: 2, md: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="eva:video-outline" width={24} sx={{ color: 'primary.main' }} />
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              fontWeight: 700,
            }}
          >
            {video.dish_name}
          </Typography>
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Iconify icon="eva:close-fill" width={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, pt: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box
          sx={{
            position: 'relative',
            width: 1,
            pt: '56.25%',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#000',
            mb: { xs: 2, md: 3 },
          }}
        >
          <video
            ref={setVideoRef}
            src={video.video}
            controls
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          >
            <track kind="captions" />
          </video>
        </Box>

        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:info-outline" width={18} sx={{ color: 'text.secondary' }} />
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                color: 'text.secondary',
              }}
            >
              Video ID: {video.id}
            </Typography>
          </Stack>
          {video.createdAt && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="eva:calendar-outline" width={18} sx={{ color: 'text.secondary' }} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                  color: 'text.secondary',
                }}
              >
                Created: {new Date(video.createdAt).toLocaleDateString()}
              </Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

