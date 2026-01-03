import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
// @mui
import { Container, CircularProgress, Alert, Box } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import SchedulingNewEditForm from '../../sections/@dashboard/scheduling/SchedulingNewEditForm';
// services
import { useScheduleDish } from '../../services';

// ----------------------------------------------------------------------

export default function SchedulingEditPage() {
  const { themeStretch } = useSettingsContext();
  
  const { id } = useParams();

  const {
    data: currentScheduling,
    isLoading,
    isError,
    error,
  } = useScheduleDish(id ? Number(id) : undefined);

  if (isLoading) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError || !currentScheduling) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error instanceof Error ? error.message : 'Failed to load schedule. Please try again.'}
        </Alert>
      </Container>
    );
  }

  // Transform IScheduleDish to IScheduling format
  const schedulingData = {
    id: currentScheduling.id,
    dish: currentScheduling.dish,
    created_at: currentScheduling.createdAt,
    is_deleted: false,
    schedule_datetime: currentScheduling.scheduleDatetime,
    scheduleDatetime: currentScheduling.scheduleDatetime,
    season: currentScheduling.season,
    status: currentScheduling.status,
    job: currentScheduling.job,
    holiday: currentScheduling.holiday,
    creator: currentScheduling.creator,
  };

  return (
    <>
      <Helmet>
        <title>Edit Schedule | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Schedule"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Scheduling',
              href: PATH_DASHBOARD.scheduling.root,
            },
            { name: currentScheduling.dish.name || 'Edit' },
          ]}
        />

        <SchedulingNewEditForm isEdit currentScheduling={schedulingData} />
      </Container>
    </>
  );
}

