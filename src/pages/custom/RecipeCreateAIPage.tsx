import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import { AIRecipeGenerationNewForm } from '../../sections/@dashboard/aiRecipeGeneration';

// ----------------------------------------------------------------------

export default function RecipeCreateAIPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Recipe: Create with AI | PlatePrep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Create Recipe with AI"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Recipes',
              href: PATH_DASHBOARD.recipes.list,
            },
            { name: 'Create with AI' },
          ]}
        />
        <AIRecipeGenerationNewForm />
      </Container>
    </>
  );
}

