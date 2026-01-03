import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Container,
  Button,
  Typography,
  Card,
  CardHeader,
  Grid,
  Stack,
  Box,
  Divider,
  IconButton,
  CircularProgress,
  Chip,
  Link,
  Alert,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// hooks
import { usePermissions } from '../../hooks/usePermissions';
// services
import { useUser, useUpdateUser } from '../../services';
// sections
import EditableField from '../../sections/@dashboard/recipe/EditableField';
import { UserProfileImage } from '../../sections/@dashboard/userNew/details';
// @types
import { IUserDetail as IUserDetailApi } from '../../@types/userApi';

// ----------------------------------------------------------------------

const StyledIcon = styled(Iconify)(({ theme }) => ({
  width: 20,
  height: 20,
  marginTop: 1,
  flexShrink: 0,
  marginRight: theme.spacing(2),
}));

// ----------------------------------------------------------------------

type IUserDetail = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  role: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  location: string;
  avatarUrl: string | null;
  branchName: string;
  branchPhone: string;
  branchEmail: string;
  branchLocation: string;
  socialLinks: Array<{ name: string; url: string }>;
};

export default function UserDetailsPage() {
  const { id } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  // Permission-based check for edit functionality
  const canEdit = hasPermission('edit_users');

  // Fetch user data using TanStack Query
  const { data: userDataFromApi, isLoading: loading, isError, error: queryError } = useUser(id);
  const updateUserMutation = useUpdateUser();

  const [userData, setUserData] = useState<IUserDetail | undefined>(undefined);
  const [editingField, setEditingField] = useState<string | null>(null);

  const error = isError ? (queryError instanceof Error ? queryError.message : 'Failed to load user') : null;

  // Transform API response to UI format
  useEffect(() => {
    if (userDataFromApi) {
      const name = `${userDataFromApi.first_name} ${userDataFromApi.last_name}`.trim();
      const addressParts = [
        userDataFromApi.street_address,
        userDataFromApi.city,
        userDataFromApi.state_province,
        userDataFromApi.postal_code,
        userDataFromApi.country,
      ].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '-';

      const transformedData: IUserDetail = {
        id: String(userDataFromApi.id),
        firstName: userDataFromApi.first_name,
        lastName: userDataFromApi.last_name,
        name,
        email: userDataFromApi.email,
        phoneNumber: userDataFromApi.phone_number || '-',
        dateOfBirth: userDataFromApi.date_of_birth,
        role: userDataFromApi.user_role?.role_name || userDataFromApi.role_name || userDataFromApi.role,
        streetAddress: userDataFromApi.street_address || '',
        city: userDataFromApi.city || '',
        stateProvince: userDataFromApi.state_province || '',
        postalCode: userDataFromApi.postal_code || '',
        country: userDataFromApi.country || '',
        location: userDataFromApi.branch?.branch_name || userDataFromApi.resturant?.resturant_name || '-',
        avatarUrl: userDataFromApi.profile_image_url || userDataFromApi.profile || null,
        branchName: userDataFromApi.branch?.branch_name || '-',
        branchPhone: userDataFromApi.branch?.phone_number || '-',
        branchEmail: userDataFromApi.branch?.email || '-',
        branchLocation: userDataFromApi.branch?.branch_location || '-',
        socialLinks: [], // Not in API response
      };

      setUserData(transformedData);
    }
  }, [userDataFromApi]);

  // Handle field edit
  const handleFieldEdit = useCallback((fieldName: string) => {
    setEditingField(fieldName);
  }, []);

  // Handle field save
  const handleFieldSave = useCallback(
    async (fieldName: string, value: string | number | string[]) => {
      if (!userData || !id) return;

      // Prevent multiple simultaneous calls
      if (updateUserMutation.isPending) {
        return;
      }

      try {
        // Map UI field names to API field names
        const apiFieldMap: Record<string, string> = {
          name: 'first_name', // Will handle separately
          firstName: 'first_name',
          lastName: 'last_name',
          streetAddress: 'street_address',
          stateProvince: 'state_province',
          postalCode: 'postal_code',
          location: 'branch_id', // Will handle separately
        };

        let updateData: Partial<IUserDetailApi> = {};

        if (fieldName === 'name') {
          // Split name into first and last name
          const nameParts = (value as string).split(' ');
          updateData.first_name = nameParts[0] || '';
          updateData.last_name = nameParts.slice(1).join(' ') || '';
        } else if (fieldName === 'location') {
          // Location update would require branch_id, skip for now
          enqueueSnackbar('Location update not supported', { variant: 'info' });
          setEditingField(null);
          return;
        } else {
          const apiFieldName = apiFieldMap[fieldName] || fieldName;
          (updateData as any)[apiFieldName] = value;
        }

        await updateUserMutation.mutateAsync({ id, data: updateData });

        // Update local state
        setUserData((prev) => {
          if (!prev) return prev;
          if (fieldName === 'name') {
            const nameParts = (value as string).split(' ');
            return {
              ...prev,
              name: value as string,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
            };
          }
          return { ...prev, [fieldName]: value };
        });

        setEditingField(null);
        enqueueSnackbar('Field updated successfully!', { variant: 'success' });
      } catch (err) {
        console.error('Error saving field:', err);
        enqueueSnackbar('Failed to update field', { variant: 'error' });
      }
    },
    [userData, id, updateUserMutation, enqueueSnackbar]
  );

  // Handle field cancel
  const handleFieldCancel = useCallback(() => {
    setEditingField(null);
  }, []);

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return date;
    }
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

  if (error || !userData) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="h6" color="error">
            {error || 'User not found'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(PATH_DASHBOARD.users.root)}
            sx={{ mt: 2 }}
          >
            Back to Users
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`User: ${userData.name} | Minimal UI`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="User Details"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Users',
              href: PATH_DASHBOARD.users.root,
            },
            { name: userData.name },
          ]}
        />

        <Grid container spacing={3}>
          {/* Profile Header Card */}
          <Grid item xs={12}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <UserProfileImage name={userData.name} role={userData.role} avatarUrl={userData.avatarUrl} />
                    
                    {canEdit && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<Iconify icon="eva:edit-outline" />}
                          onClick={() => navigate(PATH_DASHBOARD.users.edit(id!))}
                          sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                          Edit
                        </Button>
                      </Stack>
                    )}
                  </Stack>

                  {/* Name - Editable */}
                  <EditableField
                    label="Name"
                    value={userData.name}
                    type="text"
                    canEdit={canEdit}
                    isEditing={editingField === 'name'}
                    onEdit={() => handleFieldEdit('name')}
                    onSave={(value) => handleFieldSave('name', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter full name"
                  />
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* Left Column */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Contact Information */}
              <Card>
                <CardHeader title="Contact Information" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Stack direction="row">
                    <StyledIcon icon="eva:phone-fill" />
                    <Typography variant="body2">{userData.phoneNumber || '-'}</Typography>
                  </Stack>

                  <Stack direction="row">
                    <StyledIcon icon="eva:email-fill" />
                    <Typography variant="body2">{userData.email}</Typography>
                  </Stack>
                </Stack>
              </Card>

              {/* Personal Details */}
              <Card>
                <CardHeader title="Personal Details" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Stack direction="row">
                    <StyledIcon icon="eva:calendar-fill" />
                    <Typography variant="body2">{formatDate(userData.dateOfBirth)}</Typography>
                  </Stack>

                  <Stack direction="row">
                    <StyledIcon icon="ic:round-business-center" />
                    <Typography variant="body2">
                      {userData.role} at &nbsp;
                      <Link component="span" variant="subtitle2" color="text.primary">
                        {userData.location || '-'}
                      </Link>
                    </Typography>
                  </Stack>
                </Stack>
              </Card>

              {/* Restaurant Location (Branch Data) */}
              <Card>
                <CardHeader title="Restaurant Location" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Stack direction="row">
                    <StyledIcon icon="eva:home-fill" />
                    <Typography variant="body2">
                      <Link component="span" variant="subtitle2" color="text.primary">
                        {userData.branchName}
                      </Link>
                    </Typography>
                  </Stack>

                  <Stack direction="row">
                    <StyledIcon icon="eva:phone-fill" />
                    <Typography variant="body2">{userData.branchPhone}</Typography>
                  </Stack>

                  <Stack direction="row">
                    <StyledIcon icon="eva:email-fill" />
                    <Typography variant="body2">{userData.branchEmail}</Typography>
                  </Stack>

                  {userData.branchLocation && userData.branchLocation !== '-' && (
                    <Stack direction="row">
                      <StyledIcon icon="eva:pin-fill" />
                      <Typography variant="body2">{userData.branchLocation}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Address Information */}
              <Card>
                <CardHeader title="Address Information" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  {/* Address - Editable */}
                  <EditableField
                    label="Address"
                    value={userData.streetAddress}
                    type="text"
                    canEdit={canEdit}
                    isEditing={editingField === 'streetAddress'}
                    onEdit={() => handleFieldEdit('streetAddress')}
                    onSave={(value) => handleFieldSave('streetAddress', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter address"
                  />

                  {/* Location - Editable */}
                  <EditableField
                    label="Location"
                    value={userData.location}
                    type="text"
                    canEdit={canEdit}
                    isEditing={editingField === 'location'}
                    onEdit={() => handleFieldEdit('location')}
                    onSave={(value) => handleFieldSave('location', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter location"
                  />

                  {/* Postcode - Editable */}
                  <EditableField
                    label="Postcode"
                    value={userData.postalCode}
                    type="text"
                    canEdit={canEdit}
                    isEditing={editingField === 'postalCode'}
                    onEdit={() => handleFieldEdit('postalCode')}
                    onSave={(value) => handleFieldSave('postalCode', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter postcode"
                  />
                </Stack>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader title="Permissions" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Chip
                    label={userData.role}
                    color="primary"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      height: 36,
                      textTransform: 'capitalize',
                      width: 'fit-content',
                    }}
                  />

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Iconify icon="eva:settings-outline" />}
                    sx={{
                      width: '100%',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    One-off Permission
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
