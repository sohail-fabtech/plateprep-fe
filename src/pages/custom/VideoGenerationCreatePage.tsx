import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Container, Button, Stack } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';
// sections
import VideoGenerationNewEditForm from '../../sections/@dashboard/videoGeneration/VideoGenerationNewEditForm';

// ----------------------------------------------------------------------

export default function VideoGenerationCreatePage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Generate Video | PlatePrep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Generate Video"
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
              name: 'Generate',
            },
          ]}
          action={
            <Button
              component={RouterLink}
              to={PATH_DASHBOARD.videoGeneration.library}
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              sx={{
                fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                fontWeight: 600,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              Back
            </Button>
          }
        />

        <VideoGenerationNewEditForm />
      </Container>
    </>
  );
}

