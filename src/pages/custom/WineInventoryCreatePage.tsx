import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import WineInventoryNewEditForm from '../../sections/@dashboard/wineInventory/WineInventoryNewEditForm';

// ----------------------------------------------------------------------

export default function WineInventoryCreatePage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Create Wine | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create New Wine"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Wine Inventory',
              href: PATH_DASHBOARD.wineInventory.root,
            },
            { name: 'New Wine' },
          ]}
        />

        <WineInventoryNewEditForm />
      </Container>
    </>
  );
}

