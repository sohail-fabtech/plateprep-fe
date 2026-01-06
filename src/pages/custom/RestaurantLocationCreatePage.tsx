import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import RestaurantLocationNewEditForm from '../../sections/@dashboard/restaurantLocation/RestaurantLocationNewEditForm';

// ----------------------------------------------------------------------

export default function RestaurantLocationCreatePage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Create Restaurant Location | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Add New Restaurant Location"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Restaurant Locations',
              href: PATH_DASHBOARD.restaurantLocation.root,
            },
            { name: 'New Location' },
          ]}
        />

        <RestaurantLocationNewEditForm />
      </Container>
    </>
  );
}

