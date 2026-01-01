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
// _mock_
import { _userList } from '../../_mock/arrays';
// sections
import EditableField from '../../sections/@dashboard/recipe/EditableField';
import { UserProfileImage } from '../../sections/@dashboard/userNew/details';
// @types
import { IUserAccountGeneral } from '../../@types/user';

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
  restaurantName: string;
  restaurantPhone: string;
  restaurantEmail: string;
  restaurantAddress: string;
  socialLinks: Array<{ name: string; url: string }>;
};

export default function UserDetailsPage() {
  const { id } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<IUserDetail | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Check if user has edit permission
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  // Fetch user data
  useEffect(() => {
    async function loadUser() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Find user from mock data
        const mockUser = _userList.find((u) => u.id === id);
        if (mockUser) {
          // Parse name into first and last name
          const nameParts = mockUser.name?.split(' ') || [];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Build address from available fields
          const addressParts = [
            mockUser.address,
            mockUser.city,
            mockUser.state,
            mockUser.zipCode,
          ].filter(Boolean);
          const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '-';

          const userDetail: IUserDetail = {
            id: mockUser.id,
            firstName,
            lastName,
            name: mockUser.name,
            email: mockUser.email,
            phoneNumber: mockUser.phoneNumber,
            dateOfBirth: null, // Mock data doesn't have this
            role: mockUser.role,
            streetAddress: mockUser.address || '',
            city: mockUser.city || '',
            stateProvince: mockUser.state || '',
            postalCode: mockUser.zipCode || '',
            country: mockUser.country || '',
            location: mockUser.company || '-',
            avatarUrl: mockUser.avatarUrl || null,
            restaurantName: 'sialkot', // Mock data
            restaurantPhone: '+17753728288', // Mock data
            restaurantEmail: 'abc@gmail.com', // Mock data
            restaurantAddress: 'sialkot, pakistan', // Mock data
            socialLinks: [
              { name: 'whatsapp', url: 'https://web.whatsapp.com/' },
              { name: 'instagram', url: 'https://www.instagram.com/' },
            ],
          };

          setUserData(userDetail);
        } else {
          throw new Error('User not found');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user');
        setLoading(false);
        enqueueSnackbar('Failed to load user', { variant: 'error' });
      }
    }

    loadUser();
  }, [id, enqueueSnackbar]);

  // Handle field edit
  const handleFieldEdit = useCallback((fieldName: string) => {
    setEditingField(fieldName);
  }, []);

  // Handle field save
  const handleFieldSave = useCallback(
    async (fieldName: string, value: string | number | string[]) => {
      if (!userData) return;

      console.group('✏️ [USER FIELD EDIT]');
      console.log('Field Name:', fieldName);
      console.log('New Value:', value);
      console.log('User ID:', userData.id);
      console.log('User Name:', userData.name);
      console.log('Timestamp:', new Date().toISOString());
      console.log('User:', user?.email || 'Unknown');
      console.groupEnd();

      try {
        setUserData((prev) => {
          if (!prev) return prev;
          return { ...prev, [fieldName]: value };
        });

        setEditingField(null);
        enqueueSnackbar('Field updated successfully!', { variant: 'success' });

        // TODO: Make API call here
        console.log(`✅ [FIELD SAVED] ${fieldName}:`, value);
      } catch (err) {
        console.error('Error saving field:', err);
        enqueueSnackbar('Failed to update field', { variant: 'error' });
      }
    },
    [userData, user, enqueueSnackbar]
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
                  </Stack>

                  {/* Name - Editable */}
                  <EditableField
                    label="Name"
                    value={userData.name}
                    type="text"
                    canEdit={canEdit}
                    isEditing={editingField === 'name'}
                    onEdit={() => handleFieldEdit('name')}
                    onSave={(value) => {
                      const nameParts = (value as string).split(' ');
                      handleFieldSave('name', value as string);
                      handleFieldSave('firstName', nameParts[0] || '');
                      handleFieldSave('lastName', nameParts.slice(1).join(' ') || '');
                    }}
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

              {/* Restaurant Location */}
              <Card>
                <CardHeader title="Restaurant Location" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Stack direction="row">
                    <StyledIcon icon="eva:home-fill" />
                    <Typography variant="body2">
                      <Link component="span" variant="subtitle2" color="text.primary">
                        {userData.restaurantName}
                      </Link>
                    </Typography>
                  </Stack>

                  <Stack direction="row">
                    <StyledIcon icon="eva:phone-fill" />
                    <Typography variant="body2">{userData.restaurantPhone}</Typography>
                  </Stack>

                  <Stack direction="row">
                    <StyledIcon icon="eva:email-fill" />
                    <Typography variant="body2">{userData.restaurantEmail}</Typography>
                  </Stack>

                  {userData.socialLinks && userData.socialLinks.length > 0 && (
                    <Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                        {userData.socialLinks.map((social, index) => (
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
                              fontSize: '0.75rem',
                              height: 28,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
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
