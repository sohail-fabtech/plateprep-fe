import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import RoleNewEditForm from '../../sections/@dashboard/role/RoleNewEditForm';

// ----------------------------------------------------------------------

export default function RolesCreatePage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Roles: Create new role | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create a new role"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Roles',
              href: PATH_DASHBOARD.roles.root,
            },
            { name: 'New role' },
          ]}
        />

        <RoleNewEditForm />
      </Container>
    </>
  );
}

