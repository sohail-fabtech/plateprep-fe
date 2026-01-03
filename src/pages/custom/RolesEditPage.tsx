import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import { Container, Box, CircularProgress, Alert, Button } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import RoleNewEditForm from '../../sections/@dashboard/role/RoleNewEditForm';
// services
import { useRole } from '../../services';
// @types
import { IRoleDetail } from '../../@types/roleApi';

// ----------------------------------------------------------------------

export default function RolesEditPage() {
  const { themeStretch } = useSettingsContext();
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch role data
  const { data: roleData, isLoading, isError, error } = useRole(id);

  if (isLoading) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError || !roleData) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error instanceof Error ? error.message : 'Failed to load role'}
            </Alert>
          )}
          <Button
            variant="contained"
            onClick={() => navigate(PATH_DASHBOARD.roles.list)}
            sx={{ mt: 2 }}
          >
            Back to Roles
          </Button>
        </Box>
      </Container>
    );
  }

  // Check if role is editable (system roles may not be editable)
  const isEditable = (roleData as any).is_editable !== false;

  return (
    <>
      <Helmet>
        <title> Roles: Edit role | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit role"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Roles',
              href: PATH_DASHBOARD.roles.root,
            },
            { name: roleData.role_name || 'Edit role' },
          ]}
        />

        {!isEditable && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            This is a system role and cannot be edited.
          </Alert>
        )}

        <RoleNewEditForm isEdit currentRole={roleData as IRoleDetail} />
      </Container>
    </>
  );
}

