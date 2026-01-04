import { useState } from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Card, Stack, Typography, IconButton } from '@mui/material';
// @types
import { IVideoGeneration } from '../../../@types/videoGeneration';
// components
import Iconify from '../../../components/iconify';
import Label from '../../../components/label';
import MenuPopover from '../../../components/menu-popover';

// ----------------------------------------------------------------------

type Props = {
  video: IVideoGeneration;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
  filterStatus?: string;
};

export default function VideoGenerationCard({ video, onDelete, onView, filterStatus = 'all' }: Props) {
  const theme = useTheme();
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(video.id);
    }
    handleClosePopover();
  };

  const handleVideoClick = () => {
    if (onView) {
      onView(video.id);
    }
  };

  // Determine status for badge
  const getStatus = () => {
    if (video.isArchived) return 'archived';
    return video.status || 'draft';
  };

  const status = getStatus();

  return (
    <>
      <Card
        sx={{
          position: 'relative',
          boxShadow: theme.customShadows.z8,
          transition: theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            boxShadow: theme.customShadows.z20,
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box sx={{ position: 'relative', p: { xs: 0.75, sm: 1 } }}>
          {/* Status Badge - Top Left */}
          {status && (
            <Label
              variant="soft"
              color={
                (status === 'live' && 'success') ||
                (status === 'draft' && 'warning') ||
                'default'
              }
              sx={{
                top: { xs: 12, sm: 16 },
                left: { xs: 12, sm: 16 },
                zIndex: 9,
                position: 'absolute',
                textTransform: 'capitalize',
                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
              }}
            >
              {status}
            </Label>
          )}

          {/* Actions Menu - Top Right */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 12, sm: 16 },
              right: { xs: 12, sm: 16 },
              zIndex: 9,
            }}
          >
            <IconButton
              size="small"
              onClick={handleOpenPopover}
              sx={{
                width: { xs: 28, sm: 30, md: 32 },
                height: { xs: 28, sm: 30, md: 32 },
                bgcolor: alpha('#000', 0.48),
                color: 'common.white',
                backdropFilter: 'blur(6px)',
                '&:hover': {
                  bgcolor: alpha('#000', 0.64),
                },
              }}
            >
              <Iconify icon="eva:more-vertical-fill" width={18} />
            </IconButton>
          </Box>

          {/* Video Thumbnail */}
          <Box
            sx={{
              position: 'relative',
              width: 1,
              pt: '56.25%',
              borderRadius: 1.5,
              overflow: 'hidden',
              bgcolor: '#000',
              cursor: 'pointer',
            }}
            onClick={handleVideoClick}
          >
            <video
              src={video.video}
              preload="metadata"
              muted
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <track kind="captions" />
            </video>

            {/* Play Button Overlay - Always Visible */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha('#000', 0.25),
                zIndex: 10,
                transition: theme.transitions.create('background-color'),
                '&:hover': {
                  bgcolor: alpha('#000', 0.35),
                  '& .play-button': {
                    transform: 'scale(1.1)',
                    bgcolor: alpha('#fff', 0.35),
                  },
                },
              }}
            >
              <IconButton
                className="play-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVideoClick();
                }}
                sx={{
                  width: { xs: 64, sm: 72, md: 80 },
                  height: { xs: 64, sm: 72, md: 80 },
                  bgcolor: alpha('#fff', 0.25),
                  color: 'common.white',
                  backdropFilter: 'blur(8px)',
                  border: `2px solid ${alpha('#fff', 0.4)}`,
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.35),
                    borderColor: alpha('#fff', 0.6),
                  },
                  transition: 'all 0.3s',
                }}
              >
                <Iconify
                  icon="eva:play-fill"
                  width={40}
                  sx={{
                    ml: 0.5,
                    color: 'common.white',
                  }}
                />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Title - One Line */}
        <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
              fontWeight: 600,
            }}
          >
            {video.dish_name}
          </Typography>
        </Stack>
      </Card>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <Stack spacing={0.5}>
          {onDelete && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              onClick={handleDelete}
              sx={{
                px: 2,
                py: 1,
                cursor: 'pointer',
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Iconify icon="eva:trash-2-fill" width={20} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                }}
              >
                Delete
              </Typography>
            </Stack>
          )}
        </Stack>
      </MenuPopover>
    </>
  );
}

