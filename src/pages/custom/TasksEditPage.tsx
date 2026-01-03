import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
// @mui
import { Container, CircularProgress, Alert, Box } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// services
import { useTask } from '../../services';
// sections
import TaskNewEditForm from '../../sections/@dashboard/task/TaskNewEditForm';

// ----------------------------------------------------------------------

export default function TasksEditPage() {
  const { themeStretch } = useSettingsContext();
  
  const { id } = useParams();

  // Fetch task using TanStack Query
  const { data: currentTask, isLoading, isError, error } = useTask(id);

  return (
    <>
      <Helmet>
        <title>Edit Task | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Task"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Tasks',
              href: PATH_DASHBOARD.tasks.root,
            },
            { name: currentTask?.taskName || 'Loading...' },
          ]}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">
            {error instanceof Error ? error.message : 'Failed to load task. Please try again.'}
          </Alert>
        ) : currentTask ? (
          <TaskNewEditForm isEdit currentTask={currentTask} />
        ) : null}
      </Container>
    </>
  );
}

