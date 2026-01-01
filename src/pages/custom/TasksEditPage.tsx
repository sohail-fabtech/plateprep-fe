import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import TaskNewEditForm from '../../sections/@dashboard/task/TaskNewEditForm';
// mock data
import { _taskList } from '../../_mock/arrays';

// ----------------------------------------------------------------------

export default function TasksEditPage() {
  const { themeStretch } = useSettingsContext();
  
  const { id } = useParams();

  const currentTask = _taskList.find((task) => task.id === id);

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
            { name: currentTask?.taskName || 'Edit' },
          ]}
        />

        <TaskNewEditForm isEdit currentTask={currentTask} />
      </Container>
    </>
  );
}

