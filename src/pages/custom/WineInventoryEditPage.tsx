import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import LoadingScreen from '../../components/loading-screen';
// sections
import WineInventoryNewEditForm from '../../sections/@dashboard/wineInventory/WineInventoryNewEditForm';
// services
import { useWineInventory } from '../../services/wineInventory/wineInventoryHooks';

// ----------------------------------------------------------------------

export default function WineInventoryEditPage() {
  const { themeStretch } = useSettingsContext();

  const { id } = useParams();

  const { data: currentWine, isLoading, isError } = useWineInventory(id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !currentWine) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Wine"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Wine Inventory',
              href: PATH_DASHBOARD.wineInventory.root,
            },
            { name: 'Edit' },
          ]}
        />
        <div>Wine not found</div>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Wine | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Wine"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Wine Inventory',
              href: PATH_DASHBOARD.wineInventory.root,
            },
            { name: currentWine?.wineName || 'Edit' },
          ]}
        />

        <WineInventoryNewEditForm isEdit currentWine={currentWine} />
      </Container>
    </>
  );
}

