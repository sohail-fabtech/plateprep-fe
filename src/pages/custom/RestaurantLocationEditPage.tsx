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
import { useBranch } from '../../services';
// sections
import RestaurantLocationNewEditForm from '../../sections/@dashboard/restaurantLocation/RestaurantLocationNewEditForm';

// ----------------------------------------------------------------------

export default function RestaurantLocationEditPage() {
  const { themeStretch } = useSettingsContext();

  const { id } = useParams();

  // Fetch branch using TanStack Query
  const { data: currentBranch, isLoading, isError, error } = useBranch(id);

  // Transform IBranch to IRestaurantLocation format for the form
  const currentLocation = currentBranch
    ? {
        id: currentBranch.id,
        branchName: currentBranch.branchName,
        branchLocation: currentBranch.branchLocation || '',
        phoneNumber: currentBranch.phoneNumber || '',
        email: currentBranch.email || '',
        socialMedia: currentBranch.socialMedia || [],
        restaurantName: currentBranch.restaurantName,
        createdAt: currentBranch.createdAt,
        updatedAt: currentBranch.updatedAt,
        isDeleted: currentBranch.isDeleted,
      }
    : undefined;

  return (
    <>
      <Helmet>
        <title>Edit Restaurant Location | Plateprep</title>
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
            { name: currentLocation?.branchName || 'Loading...' },
          ]}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">
            {error instanceof Error ? error.message : 'Failed to load location. Please try again.'}
          </Alert>
        ) : currentLocation ? (
          <RestaurantLocationNewEditForm isEdit currentLocation={currentLocation} />
        ) : null}
      </Container>
    </>
  );
}

