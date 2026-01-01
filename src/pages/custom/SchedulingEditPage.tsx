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
import SchedulingNewEditForm from '../../sections/@dashboard/scheduling/SchedulingNewEditForm';
// mock data
import { _schedulingList } from '../../_mock/arrays';

// ----------------------------------------------------------------------

export default function SchedulingEditPage() {
  const { themeStretch } = useSettingsContext();
  
  const { id } = useParams();

  const currentScheduling = _schedulingList.find((schedule) => schedule.id === Number(id));

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
            { name: currentScheduling?.dish.name || 'Edit' },
          ]}
        />

        <SchedulingNewEditForm isEdit currentScheduling={currentScheduling} />
      </Container>
    </>
  );
}

