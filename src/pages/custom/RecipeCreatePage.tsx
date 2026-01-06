import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import RecipeNewEditForm from '../../sections/@dashboard/recipe/RecipeNewEditForm';

// ----------------------------------------------------------------------

export default function RecipeCreatePage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Recipe: Create a new recipe | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Create a new recipe"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Recipes',
              href: PATH_DASHBOARD.recipes.list,
            },
            { name: 'New recipe' },
          ]}
        />
        <RecipeNewEditForm />
      </Container>
    </>
  );
}

