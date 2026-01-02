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
import { useRecipe } from '../../services';
// sections
import RecipeNewEditForm from '../../sections/@dashboard/recipe/RecipeNewEditForm';

// ----------------------------------------------------------------------

export default function RecipeEditPage() {
  const { themeStretch } = useSettingsContext();
  const { id } = useParams();

  // Fetch recipe using TanStack Query
  const { data: currentRecipe, isLoading, isError, error } = useRecipe(id);

  return (
    <>
      <Helmet>
        <title> Recipe: Edit recipe | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Edit recipe"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Recipes',
              href: PATH_DASHBOARD.recipes.list,
            },
            { name: currentRecipe?.dishName || 'Loading...' },
          ]}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">
            {error instanceof Error ? error.message : 'Failed to load recipe. Please try again.'}
          </Alert>
        ) : currentRecipe ? (
          <RecipeNewEditForm isEdit currentRecipe={currentRecipe} />
        ) : null}
      </Container>
    </>
  );
}

