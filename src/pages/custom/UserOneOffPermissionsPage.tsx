import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import {
  Container,
  Button,
  Typography,
  Card,
  Stack,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import { PermissionMatrix } from '../../components/permission-matrix';
// hooks
import { usePermissions } from '../../hooks/usePermissions';
// services
import { useUser, useUpdateUserIndividualPermissions } from '../../services';
import { usePermissions as usePermissionsList } from '../../services/roles/roleHooks';
// utils
import {
  mapCodenameToModuleAction,
  generatePermissionId,
  convertUiPermissionIdsToApiIds,
} from '../../utils/permissionMapping';

// ----------------------------------------------------------------------

export default function UserOneOffPermissionsPage() {
  const { id } = useParams();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const canEdit = hasPermission('edit_users');

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser, isError: isErrorUser, error: userError } = useUser(id);
  
  // Fetch all permissions
  const {
    data: allPermissions,
    isLoading: isLoadingPermissions,
    isError: isErrorPermissions,
    error: permissionsError,
  } = usePermissionsList();

  const updatePermissionsMutation = useUpdateUserIndividualPermissions();

  // State for selected permissions (combined role + one-off)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [oneOffPermissions, setOneOffPermissions] = useState<string[]>([]);

  // Map role permissions to UI format
  useEffect(() => {
    if (userData && allPermissions) {
      // Map role permissions
      const rolePerms: string[] = [];
      if (userData.user_role?.permissions) {
        userData.user_role.permissions.forEach((perm) => {
          const mapped = mapCodenameToModuleAction(perm.codename);
          if (mapped) {
            const uiId = generatePermissionId(mapped.moduleCode, mapped.actionCode);
            rolePerms.push(uiId);
          }
        });
      }
      setRolePermissions(rolePerms);

      // Map individual permissions
      const individualPerms: string[] = [];
      if (userData.individual_permissions) {
        userData.individual_permissions.forEach((perm) => {
          const mapped = mapCodenameToModuleAction(perm.codename);
          if (mapped) {
            const uiId = generatePermissionId(mapped.moduleCode, mapped.actionCode);
            individualPerms.push(uiId);
          }
        });
      }
      setOneOffPermissions(individualPerms);

      // Combine for display (role + one-off)
      const combined = Array.from(new Set([...rolePerms, ...individualPerms]));
      setSelectedPermissions(combined);
    }
  }, [userData, allPermissions]);

  // Handle permission changes
  const handlePermissionsChange = useCallback(
    (newSelectedPermissions: string[]) => {
      // Filter out role permissions - only track one-off changes
      const rolePermSet = new Set(rolePermissions);
      const oneOffOnly = newSelectedPermissions.filter((perm) => !rolePermSet.has(perm));

      setSelectedPermissions(newSelectedPermissions);
      setOneOffPermissions(oneOffOnly);
    },
    [rolePermissions]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (!allPermissions || !id) {
      enqueueSnackbar('Permissions data not loaded. Cannot save.', { variant: 'error' });
      return;
    }

    try {
      // Convert UI permission IDs to API IDs
      const apiPermissionIds = convertUiPermissionIdsToApiIds(oneOffPermissions, allPermissions);

      // Call API
      await updatePermissionsMutation.mutateAsync({
        user_id: parseInt(id, 10),
        permissions: apiPermissionIds,
      });

      enqueueSnackbar('User permissions updated successfully!', { variant: 'success' });
      navigate(PATH_DASHBOARD.users.view(id));
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Failed to update user permissions. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  }, [allPermissions, id, oneOffPermissions, updatePermissionsMutation, enqueueSnackbar, navigate]);

  const isLoading = isLoadingUser || isLoadingPermissions;
  const isError = isErrorUser || isErrorPermissions;
  const error = userError || permissionsError;
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : 'Failed to load data. Please try again.';

  if (isLoading) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError || !userData) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Typography variant="h6" color="error">
            {errorMessage}
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

  const userName = `${userData.first_name} ${userData.last_name}`.trim();

  return (
    <>
      <Helmet>
        <title>{`One-Off Permissions: ${userName} | Minimal UI`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="One-Off Permissions"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Users',
              href: PATH_DASHBOARD.users.root,
            },
            {
              name: userName,
              href: PATH_DASHBOARD.users.view(id!),
            },
            { name: 'One-Off Permissions' },
          ]}
          action={
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
              onClick={() => navigate(PATH_DASHBOARD.users.view(id!))}
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                height: { xs: 40, md: 44 },
              }}
            >
              Back
            </Button>
          }
        />

        <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  mb: 1,
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                }}
              >
                One-Off Permissions for {userName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                }}
              >
                Assign additional permissions that are not part of the user&apos;s role. Role permissions are shown as
                checked and disabled.
              </Typography>
            </Box>

            {rolePermissions.length > 0 && (
              <Alert severity="info" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' } }}>
                This user has {rolePermissions.length} permission{rolePermissions.length !== 1 ? 's' : ''} from their
                role. These are shown as checked and disabled below.
              </Alert>
            )}

            {allPermissions && allPermissions.length > 0 ? (
              <PermissionMatrix
                permissions={allPermissions}
                selectedPermissions={selectedPermissions}
                onChange={handlePermissionsChange}
                disabledPermissions={rolePermissions}
                isLoading={false}
                error={null}
              />
            ) : (
              <Alert severity="warning">No permissions available to assign.</Alert>
            )}

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => navigate(PATH_DASHBOARD.users.view(id!))}
                sx={{
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  height: { xs: 40, md: 44 },
                  minWidth: { xs: 100, md: 120 },
                }}
              >
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                onClick={handleSave}
                loading={updatePermissionsMutation.isPending}
                disabled={!canEdit}
                sx={{
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  height: { xs: 40, md: 44 },
                  minWidth: { xs: 120, md: 140 },
                }}
              >
                Save Changes
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </>
  );
}

