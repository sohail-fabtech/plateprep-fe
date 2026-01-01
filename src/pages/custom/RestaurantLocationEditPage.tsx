import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// _mock_
import { _restaurantLocationList } from '../../_mock/arrays';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import RestaurantLocationNewEditForm from '../../sections/@dashboard/restaurantLocation/RestaurantLocationNewEditForm';

// ----------------------------------------------------------------------

export default function RestaurantLocationEditPage() {
  const { themeStretch } = useSettingsContext();

  const { id } = useParams();

  const currentLocation = _restaurantLocationList.find((location) => location.id === Number(id));

  return (
    <>
      <Helmet>
        <title>Edit Restaurant Location | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Restaurant Location"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Restaurant Locations',
              href: PATH_DASHBOARD.restaurantLocation.root,
            },
            { name: currentLocation?.branchName || 'Edit' },
          ]}
        />

        <RestaurantLocationNewEditForm isEdit currentLocation={currentLocation} />
      </Container>
    </>
  );
}

