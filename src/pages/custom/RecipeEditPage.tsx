import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// _mock_
import { _recipeList } from '../../_mock/arrays';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import RecipeNewEditForm from '../../sections/@dashboard/recipe/RecipeNewEditForm';

// ----------------------------------------------------------------------

export default function RecipeEditPage() {
  const { themeStretch } = useSettingsContext();

  const { id } = useParams();

  const currentRecipe = _recipeList.find((recipe) => recipe.id === id);

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
            { name: currentRecipe?.dishName },
          ]}
        />

        <RecipeNewEditForm isEdit currentRecipe={currentRecipe} />
      </Container>
    </>
  );
}

