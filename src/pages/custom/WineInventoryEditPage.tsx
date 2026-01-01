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
import WineInventoryNewEditForm from '../../sections/@dashboard/wineInventory/WineInventoryNewEditForm';
// mock data
import { _wineInventoryList } from '../../_mock/arrays';

// ----------------------------------------------------------------------

export default function WineInventoryEditPage() {
  const { themeStretch } = useSettingsContext();
  
  const { id } = useParams();

  const currentWine = _wineInventoryList.find((wine) => wine.id === id);

  return (
    <>
      <Helmet>
        <title>Edit Wine | Minimal UI</title>
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

