import { Helmet } from 'react-helmet-async';
import { useState, useMemo, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { Grid, Container, Stack, Typography, Box, Button, Card, Tabs, Tab, Divider, Alert, Pagination, LinearProgress } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IVideoGeneration, IVideoGenerationStatus } from '../../@types/videoGeneration';
// components
import { SkeletonVideoGenerationCard } from '../../components/skeleton';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import SearchNotFound from '../../components/search-not-found';
import Iconify from '../../components/iconify';
import ConfirmDialog from '../../components/confirm-dialog';
import { SubscriptionDialog } from '../../components/subscription-dialog';
// hooks
import { useDebounce } from '../../hooks/useDebounce';
import { usePermissions } from '../../hooks/usePermissions';
import { useSubscription } from '../../hooks/useSubscription';
// auth
import PermissionGuard from '../../auth/PermissionGuard';
// services
import { useRecipeVideos, RecipeVideoQueryParams } from '../../services';
// sections
import { VideoGenerationCard, VideoGenerationSearch, VideoPreviewModal } from '../../sections/@dashboard/videoGeneration';

// ----------------------------------------------------------------------

// Consistent Form Styling System (Matching Recipe, Task & Restaurant Forms)
const FORM_INPUT_SX = {
  '& .MuiInputBase-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiInputLabel-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiFormHelperText-root': {
    fontSize: { xs: '0.75rem', md: '0.75rem' },
  },
};

const STATUS_OPTIONS: IVideoGenerationStatus[] = ['all', 'live', 'archived'];
const ITEMS_PER_PAGE = 12;

export default function VideoGenerationListPage() {
  const { themeStretch } = useSettingsContext();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { hasSubscription } = useSubscription();

  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<IVideoGenerationStatus>('all');
  const [page, setPage] = useState(1);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [previewVideo, setPreviewVideo] = useState<IVideoGeneration | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  // Debounce search input (500ms delay)
  const debouncedFilterName = useDebounce(filterName, 500);

  // Reset to page 1 when search or status changes
  useEffect(() => {
    setPage(1);
  }, [debouncedFilterName, filterStatus]);

  // Build API query params
  const queryParams: RecipeVideoQueryParams = useMemo(() => {
    const params: RecipeVideoQueryParams = {
      page,
      page_size: ITEMS_PER_PAGE,
      ordering: '-id', // Default ordering: newest first
    };

    // Search parameter - use debounced value
    if (debouncedFilterName) {
      params.search = debouncedFilterName;
    }

    // Status filter mapping - is_deleted parameter
    if (filterStatus === 'archived') {
      params.is_deleted = true;
    } else if (filterStatus === 'live') {
      params.is_deleted = false;
    }
    // For "all" tab, don't send is_deleted (shows both active and archived)

    return params;
  }, [debouncedFilterName, filterStatus, page]);

  // Fetch recipe videos using API
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useRecipeVideos(queryParams);

  // Transform API data to IVideoGeneration format
  const dataFiltered: IVideoGeneration[] = useMemo(() => {
    if (!data?.results) return [];
    return data.results;
  }, [data]);

  const isNotFound = !isLoading && !isError && dataFiltered.length === 0 && !!filterName;
  const totalPages = data?.count ? Math.ceil(data.count / ITEMS_PER_PAGE) : 0;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  const handleDelete = (id: number) => {
    setSelectedVideoId(id);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (selectedVideoId) {
      console.log('Delete video:', selectedVideoId);
      // TODO: Implement actual delete API call
    }
    setOpenConfirm(false);
    setSelectedVideoId(null);
  };

  const handleFilterStatus = (event: React.SyntheticEvent<Element, Event>, newValue: string) => {
    setFilterStatus(newValue as IVideoGenerationStatus);
  };

  const handleView = (id: number) => {
    const video = dataFiltered.find((v) => v.id === id);
    if (video) {
      setPreviewVideo(video);
      setOpenPreview(true);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <>
      <Helmet>
        <title> Video Generation | PlatePrep</title>
      </Helmet>

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        message="You need an active subscription to generate videos. Please subscribe to continue."
        buttonText="Subscribe Now"
        onClose={() => setSubscriptionDialogOpen(false)}
        onButtonClick={() => {
          setSubscriptionDialogOpen(false);
          navigate(PATH_DASHBOARD.subscription);
        }}
      />

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Video Generation"
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
            },
          ]}
          action={
            <PermissionGuard permission="create_video_generation">
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => {
                  if (!hasSubscription()) {
                    setSubscriptionDialogOpen(true);
                  } else {
                    navigate(PATH_DASHBOARD.videoGeneration.create);
                  }
                }}
                sx={{
                  fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.75, sm: 1 },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0.5, sm: 0.75 },
                    '& svg': {
                      width: { xs: 16, sm: 18, md: 20 },
                      height: { xs: 16, sm: 18, md: 20 },
                    },
                  },
                }}
              >
                Generate Video
              </Button>
            </PermissionGuard>
          }
        />

        <PermissionGuard permission="view_video_generation">
          <Card sx={{ mb: { xs: 2, md: 3 } }}>
            <Tabs
              value={filterStatus}
              onChange={handleFilterStatus}
              sx={{
                px: { xs: 1.5, sm: 2 },
                bgcolor: 'background.neutral',
                '& .MuiTab-root': {
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  fontWeight: 600,
                  minHeight: { xs: 44, md: 48 },
                },
              }}
            >
              {STATUS_OPTIONS.map((tab) => (
                <Tab key={tab} label={tab} value={tab} sx={{ textTransform: 'capitalize' }} />
              ))}
            </Tabs>

          <Divider />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, md: 2 }}
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: { xs: 2, md: 2.5 } }}
          >
            <VideoGenerationSearch filterName={filterName} onFilterName={handleFilterName} />
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              }}
            >
              {data?.count || 0} {(data?.count || 0) === 1 ? 'video' : 'videos'}
            </Typography>
          </Stack>
        </Card>

        {/* Linear Progress for fetching */}
        {isFetching && <LinearProgress />}

        {/* Error State */}
        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error instanceof Error ? error.message : 'Failed to load videos. Please try again.'}
          </Alert>
        )}

        {isLoading ? (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
              <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                <SkeletonVideoGenerationCard />
              </Grid>
            ))}
          </Grid>
        ) : isNotFound ? (
          <SearchNotFound query={filterName} />
        ) : dataFiltered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 } }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary', 
                mb: 1,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                fontWeight: 600,
              }}
            >
              No videos found
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.disabled', 
                mb: { xs: 2, md: 3 },
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              }}
            >
              Start by generating your first video.
            </Typography>
            <PermissionGuard permission="create_video_generation">
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => {
                  if (!hasSubscription()) {
                    setSubscriptionDialogOpen(true);
                  } else {
                    navigate(PATH_DASHBOARD.videoGeneration.create);
                  }
                }}
                sx={{
                  fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.75, sm: 1 },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0.5, sm: 0.75 },
                    '& svg': {
                      width: { xs: 16, sm: 18, md: 20 },
                      height: { xs: 16, sm: 18, md: 20 },
                    },
                  },
                }}
              >
                Generate Video
              </Button>
            </PermissionGuard>
          </Box>
        ) : (
          <>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {dataFiltered.map((video) => (
                <Grid key={video.id} item xs={12} sm={6} md={4} lg={3}>
                  <VideoGenerationCard 
                    video={video} 
                    onDelete={handleDelete} 
                    onView={handleView}
                    filterStatus={filterStatus} 
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, md: 4 } }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
        </PermissionGuard>

        <ConfirmDialog
          open={openConfirm}
          onClose={() => {
            setOpenConfirm(false);
            setSelectedVideoId(null);
          }}
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

        <VideoPreviewModal
          open={openPreview}
          video={previewVideo}
          onClose={() => {
            setOpenPreview(false);
            setPreviewVideo(null);
          }}
        />
      </Container>
    </>
  );
}

