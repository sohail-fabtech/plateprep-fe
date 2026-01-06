import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import SchedulingNewEditForm from '../../sections/@dashboard/scheduling/SchedulingNewEditForm';

// ----------------------------------------------------------------------

export default function SchedulingCreatePage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Create Schedule | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create New Schedule"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Scheduling',
              href: PATH_DASHBOARD.scheduling.root,
            },
            { name: 'New Schedule' },
          ]}
        />

        <SchedulingNewEditForm />
      </Container>
    </>
  );
}

