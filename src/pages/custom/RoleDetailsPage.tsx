import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import { styled, useTheme } from '@mui/material/styles';
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
import { useRole, useUpdateRole, usePermissions as usePermissionsHook } from '../../services';
// sections
import EditableField from '../../sections/@dashboard/recipe/EditableField';
// @types
import { IRoleDetail } from '../../@types/roleApi';

// ----------------------------------------------------------------------

const StyledIcon = styled(Iconify)(({ theme }) => ({
  width: 20,
  height: 20,
  marginTop: 1,
  flexShrink: 0,
  marginRight: theme.spacing(2),
}));

// ----------------------------------------------------------------------

type IRoleDetailUI = {
  id: string;
  roleName: string;
  description: string;
  permissionsCount: number;
  usersCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: Array<{
    id: number;
    name: string;
    codename: string;
  }>;
};

export default function RoleDetailsPage() {
  const { id } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  // Permission-based check for edit functionality
  const canEdit = hasPermission('edit_roles');

  // Fetch role data using TanStack Query
  const { data: roleDataFromApi, isLoading: loading, isError, error: queryError } = useRole(id);
  const { data: permissionsData } = usePermissionsHook();
  const updateRoleMutation = useUpdateRole();

  const [roleData, setRoleData] = useState<IRoleDetailUI | undefined>(undefined);
  const [editingField, setEditingField] = useState<string | null>(null);

  const error = isError ? (queryError instanceof Error ? queryError.message : 'Failed to load role') : null;

  // Transform API response to UI format
  useEffect(() => {
    if (roleDataFromApi) {
      const transformedData: IRoleDetailUI = {
        id: String(roleDataFromApi.id),
        roleName: roleDataFromApi.role_name || '',
        description: roleDataFromApi.description || '',
        permissionsCount: roleDataFromApi.total_permissions || 0,
        usersCount: roleDataFromApi.users_count || 0,
        createdAt: roleDataFromApi.created_at || '',
        updatedAt: roleDataFromApi.updated_at || '',
        permissions: roleDataFromApi.permissions || [],
      };

      setRoleData(transformedData);
    }
  }, [roleDataFromApi]);

  // Handle field edit
  const handleFieldEdit = useCallback((fieldName: string) => {
    setEditingField(fieldName);
  }, []);

  // Handle field save
  const handleFieldSave = useCallback(
    async (fieldName: string, value: string | number | string[]) => {
      if (!roleData || !id) return;

      // Prevent multiple simultaneous calls
      if (updateRoleMutation.isPending) {
        return;
      }

      try {
        // Map UI field names to API field names
        const updateData: Partial<IRoleDetail> = {};

        if (fieldName === 'roleName') {
          updateData.role_name = value as string;
        } else if (fieldName === 'description') {
          updateData.description = value as string;
        } else {
          return;
        }

        await updateRoleMutation.mutateAsync({ id, data: updateData });

        // Update local state
        setRoleData((prev) => {
          if (!prev) return prev;
          return { ...prev, [fieldName]: value };
        });

        setEditingField(null);
        enqueueSnackbar('Field updated successfully!', { variant: 'success' });
      } catch (err) {
        console.error('Error saving field:', err);
        enqueueSnackbar('Failed to update field', { variant: 'error' });
      }
    },
    [roleData, id, updateRoleMutation, enqueueSnackbar]
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

  if (error || !roleData) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="h6" color="error">
            {error || 'Role not found'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(PATH_DASHBOARD.roles.root)}
            sx={{ mt: 2 }}
          >
            Back to Roles
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Role: ${roleData.roleName} | Minimal UI`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Role Details"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Roles',
              href: PATH_DASHBOARD.roles.root,
            },
            { name: roleData.roleName },
          ]}
        />

        <Grid container spacing={3}>
          {/* Profile Header Card */}
          <Grid item xs={12}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                          fontWeight: 700,
                          mb: 1,
                        }}
                      >
                        {roleData.roleName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                          color: 'text.secondary',
                        }}
                      >
                        {roleData.description || 'No description'}
                      </Typography>
                    </Box>

                    {canEdit && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<Iconify icon="eva:edit-outline" />}
                          onClick={() => navigate(PATH_DASHBOARD.roles.edit(id!))}
                          sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                          Edit
                        </Button>
                      </Stack>
                    )}
                  </Stack>

                  {/* Role Name - Editable */}
                  <EditableField
                    label="Role Name"
                    value={roleData.roleName}
                    type="text"
                    canEdit={canEdit}
                    isEditing={editingField === 'roleName'}
                    onEdit={() => handleFieldEdit('roleName')}
                    onSave={(value) => handleFieldSave('roleName', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter role name"
                  />
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* Left Column */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Statistics */}
              <Card>
                <CardHeader title="Statistics" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                      Permissions
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', md: '0.875rem' },
                      }}
                    >
                      {roleData.permissionsCount}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                      Users
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.8125rem', md: '0.875rem' },
                      }}
                    >
                      {roleData.usersCount}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader title="Metadata" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Stack direction="row">
                    <StyledIcon icon="eva:calendar-fill" />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                      Created: {formatDate(roleData.createdAt)}
                    </Typography>
                  </Stack>

                  <Stack direction="row">
                    <StyledIcon icon="eva:clock-fill" />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                      Updated: {formatDate(roleData.updatedAt)}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Description - Editable */}
              <Card>
                <CardHeader title="Description" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <EditableField
                    label="Description"
                    value={roleData.description}
                    type="multiline"
                    canEdit={canEdit}
                    isEditing={editingField === 'description'}
                    onEdit={() => handleFieldEdit('description')}
                    onSave={(value) => handleFieldSave('description', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter description"
                  />
                </Stack>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader title="Permissions" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  {roleData.permissions && roleData.permissions.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {roleData.permissions.map((permission) => (
                        <Chip
                          key={permission.id}
                          label={permission.name}
                          sx={{
                            fontSize: { xs: '0.75rem', md: '0.8125rem' },
                            height: 32,
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                      No permissions assigned
                    </Typography>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

