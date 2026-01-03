import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import {
  Container,
  Card,
  Stack,
  Typography,
  Box,
  Button,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IVideoGeneration } from '../../@types/videoGeneration';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';
import ConfirmDialog from '../../components/confirm-dialog';
import MenuPopover from '../../components/menu-popover';
// services
import { useRecipeVideo } from '../../services';

// ----------------------------------------------------------------------

export default function VideoGenerationDetailsPage() {
  const { themeStretch } = useSettingsContext();
  const { id } = useParams();
  const navigate = useNavigate();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  // Fetch recipe video using API
  const {
    data: video,
    isLoading,
    isError,
    error,
  } = useRecipeVideo(id);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleDelete = () => {
    setOpenConfirm(true);
    handleClosePopover();
  };

  const handleConfirmDelete = () => {
    console.log('Delete video:', video?.id);
    // TODO: Implement actual delete API call
    navigate(PATH_DASHBOARD.videoGeneration.library);
    setOpenConfirm(false);
  };

  if (isLoading) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Failed to load video. Please try again.'}
        </Alert>
      </Container>
    );
  }

  if (!video) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Alert severity="info">Video not found</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title> Video: {video.dish_name} | PlatePrep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={video.dish_name}
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Video Generation',
              href: PATH_DASHBOARD.videoGeneration.root,
            },
            {
              name: 'Library',
              href: PATH_DASHBOARD.videoGeneration.library,
            },
            {
              name: video.dish_name,
            },
          ]}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                component={RouterLink}
                to={PATH_DASHBOARD.videoGeneration.library}
                variant="outlined"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                sx={{
                  fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                  fontWeight: 600,
                }}
              >
                Back
              </Button>
              <IconButton
                onClick={handleOpenPopover}
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                }}
              >
                <Iconify icon="eva:more-vertical-fill" width={20} />
              </IconButton>
            </Stack>
          }
        />

        <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={3}>
            {/* Video Player */}
            <Box
              sx={{
                position: 'relative',
                width: 1,
                pt: '56.25%',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#000',
              }}
            >
              <video
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

            <Divider />

            {/* Video Information */}
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      borderRadius: 2,
                      bgcolor: 'primary.lighter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="eva:video-fill" width={24} sx={{ color: 'primary.main' }} />
                  </Box>
                  <Stack>
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                        fontWeight: 700,
                      }}
                    >
                      {video.dish_name}
                    </Typography>
                    {video.status && (
                      <Chip
                        label={video.status}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          bgcolor: video.status === 'live' ? 'success.lighter' : 'grey.200',
                          color: video.status === 'live' ? 'success.darker' : 'text.secondary',
                          textTransform: 'capitalize',
                          mt: 0.5,
                        }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Stack>

              <Divider />

              {/* Details */}
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Iconify icon="eva:hash-outline" width={20} sx={{ color: 'text.secondary' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                      color: 'text.secondary',
                    }}
                  >
                    Video ID: <strong>{video.id}</strong>
                  </Typography>
                </Stack>

                {video.createdAt && (
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Iconify icon="eva:calendar-outline" width={20} sx={{ color: 'text.secondary' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                        color: 'text.secondary',
                      }}
                    >
                      Created: <strong>{new Date(video.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</strong>
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Card>

        <MenuPopover
          open={openPopover}
          onClose={handleClosePopover}
          arrow="right-top"
          sx={{ width: 160 }}
        >
          <Stack spacing={0.5}>
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
          </Stack>
        </MenuPopover>

        <ConfirmDialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          title="Delete Video"
          content="Are you sure you want to delete this video? This action cannot be undone."
          action={
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              sx={{
                fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                fontWeight: 600,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              Delete
            </Button>
          }
        />
      </Container>
    </>
  );
}

