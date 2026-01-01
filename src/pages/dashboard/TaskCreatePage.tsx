import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import TaskNewEditForm from '../../sections/@dashboard/task/TaskNewEditForm';

// ----------------------------------------------------------------------

export default function TaskCreatePage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Create Task | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create New Task"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Tasks',
              href: PATH_DASHBOARD.tasks.root,
            },
            { name: 'New Task' },
          ]}
        />

        <TaskNewEditForm />
      </Container>
    </>
  );
}

