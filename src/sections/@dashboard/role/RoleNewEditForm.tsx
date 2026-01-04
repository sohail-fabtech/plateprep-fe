import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IRole } from '../../../@types/role';
import { IRoleDetail } from '../../../@types/roleApi';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
import { PermissionMatrix } from '../../../components/permission-matrix';
import { ProcessingDialog } from '../../../components/processing-dialog';
// services
import {
  useCreateRole,
  useUpdateRole,
  useRole,
  usePermissions,
} from '../../../services';
// utils
import {
  convertApiIdsToUiPermissionIds,
  convertUiPermissionIdsToApiIds,
} from '../../../utils/permissionMapping';
// validation
import RoleValidationSchema from './RoleValidation';

// ----------------------------------------------------------------------

type IRoleForm = {
  role_name: string;
  description: string;
  permission_ids: string[]; // UI permission IDs
};

type Props = {
  isEdit?: boolean;
  currentRole?: IRole | IRoleDetail;
};

// ----------------------------------------------------------------------

// Consistent Form Styling System
const FORM_INPUT_SX = {
  '& .MuiInputBase-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiInputLabel-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiFormHelperText-root': {
    fontSize: { xs: '0.75rem', md: '0.75rem' },
  },
};

export default function RoleNewEditForm({ isEdit = false, currentRole }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Fetch permissions
  const { data: permissionsData, isLoading: isLoadingPermissions, isError: isPermissionsError, error: permissionsError } = usePermissions();

  // Fetch role data if editing
  const roleId = isEdit && currentRole ? String(currentRole.id) : undefined;
  const { data: roleData, isLoading: isLoadingRole } = useRole(roleId);

  // Parse currentRole data if editing
  const parsedRole = useMemo(() => {
    if (!currentRole && !roleData) return null;
    
    const role = roleData || currentRole;
    if (!role) return null;

    return {
      role_name: 'role_name' in role ? role.role_name : role.name || '',
      description: role.description || '',
      permissions: 'permissions' in role ? role.permissions : [],
    };
  }, [currentRole, roleData]);

  const defaultValues = useMemo<IRoleForm>(
    () => ({
      role_name: parsedRole?.role_name || '',
      description: parsedRole?.description || '',
      permission_ids: [], // Will be populated after permissions are loaded
    }),
    [parsedRole]
  );

  const methods = useForm<IRoleForm>({
    resolver: yupResolver(RoleValidationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  // Processing dialog state
  const [processingDialog, setProcessingDialog] = useState<{
    open: boolean;
    state: 'processing' | 'success' | 'error';
    message: string;
  }>({
    open: false,
    state: 'processing',
    message: '',
  });

  // Convert API permission IDs to UI permission IDs when role data is loaded
  useEffect(() => {
    if (isEdit && parsedRole && permissionsData && permissionsData.length > 0) {
      const apiPermissionIds = parsedRole.permissions?.map((p: any) => p.id) || [];
      const uiPermissionIds = convertApiIdsToUiPermissionIds(apiPermissionIds, permissionsData);
      
      reset({
        role_name: parsedRole.role_name || '',
        description: parsedRole.description || '',
        permission_ids: uiPermissionIds,
      });
    }
  }, [isEdit, parsedRole, permissionsData, reset]);

  // Show loading state while fetching permissions or role data
  const isLoading = isLoadingPermissions || (isEdit && isLoadingRole);

  const onSubmit = async (data: IRoleForm) => {
    // Show processing dialog
    setProcessingDialog({
      open: true,
      state: 'processing',
      message: isEdit ? 'Updating role...' : 'Creating role...',
    });

    try {
      if (!permissionsData || permissionsData.length === 0) {
        setProcessingDialog({
          open: true,
          state: 'error',
          message: 'Permissions are not available. Please try again.',
        });
        return;
      }

      // Convert UI permission IDs to API permission IDs
      const apiPermissionIds = convertUiPermissionIdsToApiIds(data.permission_ids, permissionsData);

      if (apiPermissionIds.length === 0) {
        setProcessingDialog({
          open: true,
          state: 'error',
          message: 'Please select at least one valid permission.',
        });
        return;
      }

      const apiPayload = {
        role_name: data.role_name.trim(),
        description: data.description.trim(),
        permission_ids: apiPermissionIds,
      };

      setProcessingDialog({
        open: true,
        state: 'processing',
        message: isEdit ? 'Updating role...' : 'Creating role...',
      });

      if (isEdit && roleId) {
        // Update role
        await updateRoleMutation.mutateAsync({
          id: roleId,
          data: apiPayload,
        });
        setProcessingDialog({
          open: true,
          state: 'success',
          message: 'Role updated successfully',
        });
        setTimeout(() => {
          navigate(PATH_DASHBOARD.roles.list);
        }, 1500);
      } else {
        // Create role
        await createRoleMutation.mutateAsync(apiPayload);
        setProcessingDialog({
          open: true,
          state: 'success',
          message: 'Role created successfully',
        });
        setTimeout(() => {
          navigate(PATH_DASHBOARD.roles.list);
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting role form:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to save role. Please try again.';
      setProcessingDialog({
        open: true,
        state: 'error',
        message: errorMessage,
      });
    }
  };

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isPermissionsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {permissionsError instanceof Error
          ? permissionsError.message
          : 'Failed to load permissions. Please try again.'}
      </Alert>
    );
  }

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 2, md: 3 },
                fontWeight: 700,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              }}
            >
              Basic Information
            </Typography>

            <Stack spacing={{ xs: 2, md: 3 }}>
              <RHFTextField
                name="role_name"
                label="Role Name"
                placeholder="Enter role name"
                sx={FORM_INPUT_SX}
              />

              <RHFTextField
                name="description"
                label="Description"
                placeholder="Enter role description"
                multiline
                rows={4}
                sx={FORM_INPUT_SX}
              />
            </Stack>
          </Card>
        </Grid>

        {/* Permissions */}
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 2, md: 3 },
                fontWeight: 700,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              }}
            >
              Permissions
            </Typography>

            {permissionsData && permissionsData.length > 0 ? (
              <Box>
                <PermissionMatrix
                  permissions={permissionsData}
                  selectedPermissions={values.permission_ids || []}
                  onChange={(selectedPermissions) => setValue('permission_ids', selectedPermissions)}
                  isLoading={false}
                  error={null}
                />
                {errors.permission_ids && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.permission_ids.message}
                  </Alert>
                )}
              </Box>
            ) : (
              <Alert severity="info">No permissions available.</Alert>
            )}
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => navigate(PATH_DASHBOARD.roles.list)}
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                height: { xs: 40, md: 44 },
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting || createRoleMutation.isPending || updateRoleMutation.isPending}
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                height: { xs: 40, md: 44 },
              }}
            >
              {isEdit ? 'Update Role' : 'Create Role'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

