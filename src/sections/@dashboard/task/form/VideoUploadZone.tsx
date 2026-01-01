import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
// @mui
import { Box, Stack, Typography, IconButton, Card, alpha, Chip, useTheme, MenuItem, MenuList } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';

// ----------------------------------------------------------------------

type VideoFile = {
  url: string;
  name: string;
  type: 'preparation' | 'presentation';
};

type Props = {
  video?: VideoFile | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onTypeChange: (type: 'preparation' | 'presentation') => void;
  error?: boolean;
  helperText?: string;
};

export default function VideoUploadZone({ 
  video, 
  onUpload, 
  onRemove, 
  onTypeChange,
  error, 
  helperText 
}: Props) {
  const theme = useTheme();
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
          onUpload(acceptedFiles[0]);
        }
      },
      [onUpload]
    ),
  });

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleToggleType = () => {
    if (video) {
      onTypeChange(video.type === 'preparation' ? 'presentation' : 'preparation');
    }
    handleClosePopover();
  };

  const handleRemove = () => {
    onRemove();
    handleClosePopover();
  };

  return (
    <Box>
      {/* Upload Zone */}
      <Box
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 2,
          cursor: 'pointer',
          border: `2px dashed ${
            error
              ? theme.palette.error.main
              : isDragActive
              ? theme.palette.primary.main
              : alpha(theme.palette.grey[500], 0.32)
          }`,
          bgcolor: isDragActive
            ? alpha(theme.palette.primary.main, 0.08)
            : alpha(theme.palette.grey[500], 0.04),
          transition: theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        <input {...getInputProps()} />
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Iconify
              icon="eva:video-fill"
              width={32}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Drop or Select Video
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Drop video here or click to{' '}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: 'primary.main', textDecoration: 'underline' }}
              >
                browse
              </Typography>{' '}
              through your files
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Supported formats: MP4, MOV, AVI, MKV, WEBM
          </Typography>
        </Stack>
      </Box>

      {helperText && (
        <Typography variant="caption" sx={{ color: error ? 'error.main' : 'text.secondary', px: 2 }}>
          {helperText}
        </Typography>
      )}

      {/* Video Gallery - Mobile responsive with horizontal scroll */}
      {video && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Uploaded Video
          </Typography>
          
          <Box
            sx={{
              display: { xs: 'flex', md: 'grid' },
              gridTemplateColumns: { md: 'repeat(auto-fill, minmax(280px, 1fr))' },
              gap: 2,
              overflowX: { xs: 'auto', md: 'visible' },
              pb: { xs: 2, md: 0 },
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.grey[600], 0.48),
                borderRadius: 4,
              },
            }}
          >
            <Card
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: theme.customShadows.z8,
                flexShrink: 0,
                width: { xs: 240, sm: 280, md: '100%' },
                minWidth: { xs: 240, sm: 280, md: 'auto' },
                '&:hover .video-actions': {
                  opacity: 1,
                },
              }}
            >
              <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                <video
                  src={video.url}
                  controls
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                >
                  <track kind="captions" />
                </video>

                {/* Video Type Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: 4, md: 8 },
                    left: { xs: 4, md: 8 },
                    zIndex: 9,
                  }}
                >
                  <Chip
                    label={video.type === 'preparation' ? 'Preparation' : 'Presentation'}
                    size="small"
                    sx={{
                      height: { xs: 16, md: 20 },
                      fontSize: { xs: '0.625rem', md: '0.6875rem' },
                      fontWeight: 700,
                      bgcolor: video.type === 'preparation' ? theme.palette.primary.main : theme.palette.success.main,
                      color: '#fff',
                    }}
                  />
                </Box>

                {/* Actions - 3 dots menu on mobile, buttons on desktop */}
                <Box
                  className="video-actions"
                  sx={{
                    position: 'absolute',
                    top: { xs: 4, md: 8 },
                    right: { xs: 4, md: 8 },
                    opacity: { xs: 1, md: 0 },
                    transition: theme.transitions.create('opacity'),
                    zIndex: 9,
                  }}
                >
                  {/* Mobile: 3 dots menu */}
                  <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <IconButton
                      size="small"
                      onClick={handleOpenPopover}
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: alpha(theme.palette.grey[900], 0.72),
                        color: theme.palette.common.white,
                        backdropFilter: 'blur(6px)',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.grey[900], 0.88),
                        },
                      }}
                    >
                      <Iconify icon="eva:more-vertical-fill" width={18} />
                    </IconButton>
                  </Box>

                  {/* Desktop: Action buttons */}
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onTypeChange(video.type === 'preparation' ? 'presentation' : 'preparation')}
                      sx={{
                        bgcolor: alpha(theme.palette.common.white, 0.9),
                        '&:hover': {
                          bgcolor: theme.palette.common.white,
                        },
                      }}
                    >
                      <Iconify icon="eva:swap-outline" width={16} />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={onRemove}
                      sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.9),
                        color: '#fff',
                        '&:hover': {
                          bgcolor: theme.palette.error.main,
                        },
                      }}
                    >
                      <Iconify icon="eva:trash-2-outline" width={16} />
                    </IconButton>
                  </Stack>
                </Box>
              </Box>

              {/* Video Info */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ p: { xs: 1.5, md: 2 } }}>
                <Iconify icon="eva:video-fill" width={{ xs: 20, md: 24 }} sx={{ color: theme.palette.primary.main }} />
                <Typography variant="subtitle2" noWrap sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                  {video.name}
                </Typography>
              </Stack>
            </Card>
          </Box>
        </Box>
      )}

      {/* Popover Menu for Mobile */}
      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="top-right"
        sx={{ 
          width: 180,
          '& .MuiMenuItem-root': {
            px: 1.5,
            py: 1,
            borderRadius: 0.75,
            typography: 'body2',
            fontWeight: 500,
          },
        }}
      >
        <MenuList sx={{ p: 1 }}>
          <MenuItem 
            onClick={handleToggleType}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.08),
                color: 'info.main',
              },
            }}
          >
            <Iconify 
              icon="eva:swap-fill" 
              width={20}
              sx={{ mr: 1.5, color: 'info.main' }}
            />
            Change Type
          </MenuItem>

          <Box sx={{ my: 0.5, borderTop: `dashed 1px ${theme.palette.divider}` }} />

          <MenuItem 
            onClick={handleRemove}
            sx={{
              color: 'error.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            <Iconify 
              icon="eva:trash-2-fill" 
              width={20}
              sx={{ mr: 1.5 }}
            />
            Delete Video
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Box>
  );
}

