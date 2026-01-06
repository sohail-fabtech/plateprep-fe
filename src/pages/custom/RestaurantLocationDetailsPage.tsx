import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import {
  Container,
  Button,
  Typography,
  Card,
  Grid,
  Stack,
  Box,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import SvgColor from '../../components/svg-color';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// hooks
import { usePermissions } from '../../hooks/usePermissions';
// services
import { useBranch, useUpdateBranch } from '../../services';
// types
import { IRestaurantLocation } from '../../@types/restaurantLocation';
// sections
import EditableField from '../../sections/@dashboard/recipe/EditableField';

// ----------------------------------------------------------------------

type TabValue = 'users' | 'recipes' | 'wineInventory' | 'tasks';

// Icon helper - same as sidebar navigation
const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

// Tab icons - matching sidebar navigation
const TAB_ICONS = {
  users: icon('ic_user'),
  recipes: icon('ic_recipes'),
  wineInventory: icon('ic_wine'),
  tasks: icon('ic_kanban'),
};

export default function RestaurantLocationDetailsPage() {
  const { id } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const [locationData, setLocationData] = useState<IRestaurantLocation | undefined>(undefined);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabValue>('users');

  // Permission-based check for edit functionality
  const canEdit = hasPermission('edit_branches');

  // Fetch location data using TanStack Query
  const { data: branchDataFromApi, isLoading: loading, isError, error: queryError } = useBranch(id);
  const updateBranchMutation = useUpdateBranch();

  const error = isError ? (queryError instanceof Error ? queryError.message : 'Failed to load location') : null;

  // Transform API response to IRestaurantLocation format
  useEffect(() => {
    if (branchDataFromApi) {
      const transformedData: IRestaurantLocation = {
        id: branchDataFromApi.id,
        branchName: branchDataFromApi.branchName,
        branchLocation: branchDataFromApi.branchLocation || '',
        phoneNumber: branchDataFromApi.phoneNumber || '',
        email: branchDataFromApi.email || '',
        socialMedia: branchDataFromApi.socialMedia || [],
        restaurantName: branchDataFromApi.restaurantName,
        createdAt: branchDataFromApi.createdAt,
        updatedAt: branchDataFromApi.updatedAt,
        isDeleted: branchDataFromApi.isDeleted,
      };
      setLocationData(transformedData);
    }
  }, [branchDataFromApi]);

  // Handle field edit
  const handleFieldEdit = useCallback((fieldName: string) => {
    setEditingField(fieldName);
  }, []);

  // Handle field save
  const handleFieldSave = useCallback(
    async (fieldName: string, value: string | number | string[]) => {
      if (!locationData || !id) return;

      // Prevent multiple simultaneous calls
      if (updateBranchMutation.isPending) {
        return;
      }

      try {
        // Map UI field names to API field names
        const apiFieldMap: Record<string, string> = {
          branchName: 'branch_name',
          branchLocation: 'branch_location',
          phoneNumber: 'phone_number',
          email: 'email',
        };

        const apiFieldName = apiFieldMap[fieldName];
        if (!apiFieldName) {
          console.error('Unknown field name:', fieldName);
          enqueueSnackbar('Unknown field', { variant: 'error' });
          return;
        }

        // Prepare update data
        const updateData: Record<string, any> = {
          [apiFieldName]: value,
        };

        // Call API to update branch
        const updatedBranch = await updateBranchMutation.mutateAsync({
          id: locationData.id,
          data: updateData,
        });

        // Update local state with transformed API response
        const transformedData: IRestaurantLocation = {
          id: updatedBranch.id,
          branchName: updatedBranch.branchName,
          branchLocation: updatedBranch.branchLocation || '',
          phoneNumber: updatedBranch.phoneNumber || '',
          email: updatedBranch.email || '',
          socialMedia: updatedBranch.socialMedia || [],
          restaurantName: updatedBranch.restaurantName,
          createdAt: updatedBranch.createdAt,
          updatedAt: updatedBranch.updatedAt,
          isDeleted: updatedBranch.isDeleted,
        };

        setLocationData(transformedData);
        setEditingField(null);
        enqueueSnackbar('Field updated successfully!', { variant: 'success' });
      } catch (err) {
        console.error('Error saving field:', err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update field. Please try again.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    },
    [locationData, id, updateBranchMutation, enqueueSnackbar]
  );

  // Handle field cancel
  const handleFieldCancel = useCallback(() => {
    setEditingField(null);
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setCurrentTab(newValue);
  };

  // Handle redirect to filtered pages
  const handleRedirectToUsers = () => {
    if (!locationData?.id) return;
    const url = `${PATH_DASHBOARD.user.list}?location=${locationData.id}`;
    console.log('Redirecting to Users page with location ID:', locationData.id);
    navigate(url);
  };

  const handleRedirectToRecipes = () => {
    if (!locationData?.id) return;
    const url = `${PATH_DASHBOARD.recipes.list}?location=${locationData.id}`;
    console.log('Redirecting to Recipes page with location ID:', locationData.id);
    navigate(url);
  };

  const handleRedirectToWineInventory = () => {
    if (!locationData?.id) return;
    const url = `${PATH_DASHBOARD.wineInventory.list}?location=${locationData.id}`;
    console.log('Redirecting to Wine Inventory page with location ID:', locationData.id);
    navigate(url);
  };

  const handleRedirectToTasks = () => {
    if (!locationData?.id) return;
    const url = `${PATH_DASHBOARD.tasks.list}?location=${locationData.id}`;
    console.log('Redirecting to Tasks page with location ID:', locationData.id);
    navigate(url);
  };

  if (loading) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !locationData) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h6" color="error">
            {error || 'Location not found'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(PATH_DASHBOARD.restaurantLocation.list)}
            sx={{ mt: 2 }}
          >
            Back to Locations
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Location: ${locationData.branchName} | Plateprep`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Branch Detail"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Restaurant Locations',
              href: PATH_DASHBOARD.restaurantLocation.root,
            },
            { name: locationData.branchName },
          ]}
        />

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Header Card */}
          <Grid item xs={12}>
            <Card sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Iconify icon="eva:home-fill" width={24} sx={{ color: 'primary.main' }} />
                <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 700 }}>
                  Branch Detail
                </Typography>
              </Stack>

              <Grid container spacing={{ xs: 2, md: 3 }}>
                {/* Location Name - Editable */}
                <Grid item xs={12} md={6}>
                  <EditableField
                    label="Name"
                    value={locationData.branchName}
                    type="text"
                    canEdit={canEdit}
                    isEditing={editingField === 'branchName'}
                    onEdit={() => handleFieldEdit('branchName')}
                    onSave={(value) => handleFieldSave('branchName', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter location name"
                  />
                </Grid>

                {/* Email - Read Only */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderRadius: 1.5,
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Email
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: 'text.primary',
                        fontWeight: 500,
                      }}
                    >
                      {locationData.email}
                    </Typography>
                  </Box>
                </Grid>

                {/* Phone Number - Editable */}
                <Grid item xs={12} md={6}>
                  <EditableField
                    label="Phone Number"
                    value={locationData.phoneNumber}
                    type="text"
                    canEdit={canEdit}
                    isEditing={editingField === 'phoneNumber'}
                    onEdit={() => handleFieldEdit('phoneNumber')}
                    onSave={(value) => handleFieldSave('phoneNumber', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter phone number"
                  />
                </Grid>

                {/* Address - Editable */}
                <Grid item xs={12} md={6}>
                  <EditableField
                    label="Address"
                    value={locationData.branchLocation}
                    type="multiline"
                    canEdit={canEdit}
                    isEditing={editingField === 'branchLocation'}
                    onEdit={() => handleFieldEdit('branchLocation')}
                    onSave={(value) => handleFieldSave('branchLocation', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter address"
                  />
                </Grid>

                {/* Social Links */}
                {locationData.socialMedia && locationData.socialMedia.length > 0 && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          mb: 1,
                          display: 'block',
                        }}
                      >
                        Social Links
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {locationData.socialMedia.map((social, index) => (
                          <Chip
                            key={index}
                            label={social.name}
                            component="a"
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            clickable
                            size="small"
                            sx={{
                              fontSize: { xs: '0.6875rem', md: '0.75rem' },
                              height: { xs: 24, md: 28 },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Grid>

          {/* Tabs Section */}
          <Grid item xs={12}>
            <Card sx={{ overflow: 'hidden' }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  bgcolor: 'background.neutral',
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                    fontWeight: 600,
                    minHeight: { xs: 44, md: 48 },
                  },
                }}
              >
                <Tab
                  label="Users"
                  value="users"
                //   icon={TAB_ICONS.users}
                  iconPosition="start"
                />
                <Tab
                  label="Recipes"
                  value="recipes"
                //   icon={TAB_ICONS.recipes}
                  iconPosition="start"
                />
                <Tab
                  label="Wine Inventory"
                  value="wineInventory"
                //   icon={TAB_ICONS.wineInventory}
                  iconPosition="start"
                />
                <Tab
                  label="Tasks"
                  value="tasks"
                //   icon={TAB_ICONS.tasks}
                  iconPosition="start"
                />
              </Tabs>

              <Divider />

              {/* Tab Content */}
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {currentTab === 'users' && (
                  <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
                    <SvgColor
                      src="/assets/icons/navbar/ic_user.svg"
                      sx={{
                        width: 64,
                        height: 64,
                        color: 'text.disabled',
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                      View Users for This Location
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        maxWidth: 500,
                        fontSize: { xs: '0.8125rem', md: '0.875rem' },
                      }}
                    >
                      Click the button below to view all users assigned to this restaurant location. The users list
                      will be automatically filtered for this location.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<Iconify icon="eva:arrow-forward-outline" />}
                      onClick={handleRedirectToUsers}
                      sx={{ mt: 2 }}
                    >
                      View Users
                    </Button>
                  </Stack>
                )}

                {currentTab === 'recipes' && (
                  <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
                    <SvgColor
                      src="/assets/icons/navbar/ic_recipes.svg"
                      sx={{
                        width: 64,
                        height: 64,
                        color: 'text.disabled',
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                      View Recipes for This Location
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        maxWidth: 500,
                        fontSize: { xs: '0.8125rem', md: '0.875rem' },
                      }}
                    >
                      Click the button below to view all recipes assigned to this restaurant location. The recipes
                      list will be automatically filtered for this location.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<Iconify icon="eva:arrow-forward-outline" />}
                      onClick={handleRedirectToRecipes}
                      sx={{ mt: 2 }}
                    >
                      View Recipes
                    </Button>
                  </Stack>
                )}

                {currentTab === 'wineInventory' && (
                  <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
                    <SvgColor
                      src="/assets/icons/navbar/ic_wine.svg"
                      sx={{
                        width: 64,
                        height: 64,
                        color: 'text.disabled',
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                      View Wine Inventory for This Location
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        maxWidth: 500,
                        fontSize: { xs: '0.8125rem', md: '0.875rem' },
                      }}
                    >
                      Click the button below to view all wine inventory items for this restaurant location. The wine
                      inventory list will be automatically filtered for this location.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<Iconify icon="eva:arrow-forward-outline" />}
                      onClick={handleRedirectToWineInventory}
                      sx={{ mt: 2 }}
                    >
                      View Wine Inventory
                    </Button>
                  </Stack>
                )}

                {currentTab === 'tasks' && (
                  <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
                    <SvgColor
                      src="/assets/icons/navbar/ic_kanban.svg"
                      sx={{
                        width: 64,
                        height: 64,
                        color: 'text.disabled',
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                      View Tasks for This Location
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        maxWidth: 500,
                        fontSize: { xs: '0.8125rem', md: '0.875rem' },
                      }}
                    >
                      Click the button below to view all tasks assigned to this restaurant location. The tasks list
                      will be automatically filtered for this location.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<Iconify icon="eva:arrow-forward-outline" />}
                      onClick={handleRedirectToTasks}
                      sx={{ mt: 2 }}
                    >
                      View Tasks
                    </Button>
                  </Stack>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
