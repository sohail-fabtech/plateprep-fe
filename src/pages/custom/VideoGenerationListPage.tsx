import { Helmet } from 'react-helmet-async';
import { useState, useMemo, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { Grid, Container, Stack, Typography, Box, Button, Card, Tabs, Tab, Divider } from '@mui/material';
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
// sections
import { VideoGenerationCard, VideoGenerationSearch, VideoPreviewModal } from '../../sections/@dashboard/videoGeneration';
// mock
import { _videoGenerationList } from '../../_mock/arrays';

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

export default function VideoGenerationListPage() {
  const { themeStretch } = useSettingsContext();
  const navigate = useNavigate();

  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<IVideoGenerationStatus>('all');
  const [loading, setLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [previewVideo, setPreviewVideo] = useState<IVideoGeneration | null>(null);
  const [openPreview, setOpenPreview] = useState(false);

  // Simulate loading state
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const dataFiltered = useMemo(() => {
    let filtered = _videoGenerationList;

    // Filter by status
    if (filterStatus === 'archived') {
      filtered = filtered.filter((video) => video.isArchived);
    } else if (filterStatus === 'live') {
      filtered = filtered.filter((video) => !video.isArchived && video.status === 'live');
    } else if (filterStatus === 'all') {
      filtered = filtered.filter((video) => !video.isArchived);
    }

    // Filter by name
    if (filterName) {
      filtered = filtered.filter((video) =>
        video.dish_name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
    }

    return filtered;
  }, [filterName, filterStatus]);

  const isNotFound = !dataFiltered.length && !!filterName;

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
    const video = _videoGenerationList.find((v) => v.id === id);
    if (video) {
      setPreviewVideo(video);
      setOpenPreview(true);
    }
  };


  return (
    <>
      <Helmet>
        <title> Video Generation | PlatePrep</title>
      </Helmet>

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
            <Button
              component={RouterLink}
              to={PATH_DASHBOARD.videoGeneration.create}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
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
          }
        />

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
              {dataFiltered.length} {dataFiltered.length === 1 ? 'video' : 'videos'}
            </Typography>
          </Stack>
        </Card>

        {loading ? (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {[...Array(6)].map((_, index) => (
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
            <Button
              component={RouterLink}
              to={PATH_DASHBOARD.videoGeneration.create}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
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
          </Box>
        ) : (
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
        )}

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

