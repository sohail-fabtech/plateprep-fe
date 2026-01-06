import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import {
  Container,
  Button,
  Typography,
  Card,
  Grid,
  Stack,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';
import { fCurrency } from '../../utils/formatNumber';
// sections
import { IngredientItem, StepItem } from '../../sections/@dashboard/recipe/details';

// ----------------------------------------------------------------------

interface AIRecipeData {
  welcome?: string;
  to?: string;
  plateprep?: string;
  training_phrase?: string;
  ingridiants_start?: string;
  cuisine_style?: string;
  menu_class?: string;
  dish_name?: string;
  description?: string;
  win_pairings?: string[];
  ingredients?: Array<{
    'Ingredient name'?: string;
    Quantity?: string;
    Unit?: string;
  }>;
  essentials_needed?: Array<{
    'Equipment name'?: string;
    Quantity?: string;
  }>;
  steps?: string[];
  starch_preparation?: string | null;
  plating_instructions?: string;
  price_range?: number;
}

interface LocationState {
  apiResponse?: {
    result?: string;
    [key: string]: any;
  };
  formData?: {
    cuisine_style?: string;
    menu_class?: string;
    seasonalIngredients?: string;
    dietary_preferences?: string;
    dietary_restrictions?: string;
    available_ingredients?: string;
    price_range?: number;
    target_audience?: string;
    theme?: string;
  };
}

export default function RecipeAIPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  const [recipeData, setRecipeData] = useState<AIRecipeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const state = location.state as LocationState | null;

  // Parse the JSON string from API response
  useEffect(() => {
    try {
      if (!state?.apiResponse?.result) {
        setError('No recipe data found. Please generate a recipe first.');
        setIsLoading(false);
        return;
      }

      const parsedData = JSON.parse(state.apiResponse.result) as AIRecipeData;
      setRecipeData(parsedData);
      setIsLoading(false);
    } catch (err) {
      console.error('Error parsing recipe data:', err);
      setError('Failed to parse recipe data. Please try again.');
      setIsLoading(false);
    }
  }, [state]);

  // Handle Reject
  const handleReject = () => {
    navigate(PATH_DASHBOARD.recipes.newAI, {
      state: {
        formData: state?.formData,
      },
    });
  };

  // Handle Approve
  const handleApprove = () => {
    // Navigate to recipe creation form with AI data
    navigate(PATH_DASHBOARD.recipes.new, {
      state: {
        approvedRecipeData: recipeData,
        formData: state?.formData,
      },
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !recipeData) {
    return (
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="AI Recipe Preview"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Recipes', href: PATH_DASHBOARD.recipes.list },
            { name: 'AI Recipe Generation', href: PATH_DASHBOARD.recipes.newAI },
            { name: 'Preview' },
          ]}
          sx={{ mb: { xs: 3, md: 4 } }}
        />
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Recipe data not found'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate(PATH_DASHBOARD.recipes.newAI)}
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
        >
          Back to AI Recipe Generation
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Recipe Preview | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        {/* Breadcrumbs */}
        <CustomBreadcrumbs
          heading="AI Recipe Preview"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Recipes', href: PATH_DASHBOARD.recipes.list },
            { name: 'AI Recipe Generation', href: PATH_DASHBOARD.recipes.newAI },
            { name: 'Preview' },
          ]}
          sx={{ mb: { xs: 3, md: 4 } }}
        />

        {/* Overview Section */}
        <Card sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1a2942',
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  mb: 1,
                }}
              >
                {recipeData.dish_name || 'Untitled Recipe'}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  lineHeight: 1.6,
                }}
              >
                {recipeData.description || 'No description provided.'}
              </Typography>
            </Box>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: 'text.disabled',
                      letterSpacing: 1,
                      fontSize: { xs: '0.625rem', md: '0.65rem' },
                    }}
                  >
                    Cuisine Style
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
                      fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
                    }}
                  >
                    {recipeData.cuisine_style || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: 'text.disabled',
                      letterSpacing: 1,
                      fontSize: { xs: '0.625rem', md: '0.65rem' },
                    }}
                  >
                    Menu Class
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
                      fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
                    }}
                  >
                    {recipeData.menu_class || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: 'text.disabled',
                      letterSpacing: 1,
                      fontSize: { xs: '0.625rem', md: '0.65rem' },
                    }}
                  >
                    Menu Price
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
                      fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
                    }}
                  >
                    {recipeData.price_range !== undefined ? fCurrency(recipeData.price_range) : 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              {recipeData.win_pairings && recipeData.win_pairings.length > 0 && (
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: 'text.disabled',
                        letterSpacing: 1,
                        fontSize: { xs: '0.625rem', md: '0.65rem' },
                      }}
                    >
                      Wine Pairings
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                      {recipeData.win_pairings.map((wine, index) => (
                        <Chip
                          key={index}
                          label={wine}
                          size="small"
                          sx={{
                            fontSize: { xs: '0.6875rem', md: '0.75rem' },
                            height: 24,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Stack>
        </Card>

        {/* Ingredients Section */}
        {recipeData.ingredients && recipeData.ingredients.length > 0 && (
          <Card sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1a2942',
                fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                mb: { xs: 2, md: 3 },
              }}
            >
              Ingredients
            </Typography>
            {recipeData.ingridiants_start && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 2,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                }}
              >
                {recipeData.ingridiants_start}
              </Typography>
            )}
            <Stack spacing={1.5}>
              {recipeData.ingredients.map((ingredient, index) => (
                <IngredientItem
                  key={index}
                  name={ingredient['Ingredient name'] || 'Unknown Ingredient'}
                  quantity={ingredient.Quantity || 'N/A'}
                  unit={ingredient.Unit || ''}
                  canEdit={false}
                />
              ))}
            </Stack>
          </Card>
        )}

        {/* Essentials Needed Section */}
        {recipeData.essentials_needed && recipeData.essentials_needed.length > 0 && (
          <Card sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1a2942',
                fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                mb: { xs: 2, md: 3 },
              }}
            >
              Essentials Needed
            </Typography>
            <Stack spacing={1.5}>
              {recipeData.essentials_needed.map((essential, index) => (
                <IngredientItem
                  key={index}
                  name={essential['Equipment name'] || 'Unknown Equipment'}
                  quantity={essential.Quantity || 'N/A'}
                  canEdit={false}
                />
              ))}
            </Stack>
          </Card>
        )}

        {/* Steps Section */}
        {recipeData.steps && recipeData.steps.length > 0 && (
          <Card sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1a2942',
                fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                mb: { xs: 2, md: 3 },
              }}
            >
              Preparation Steps
            </Typography>
            <Stack spacing={1.5}>
              {recipeData.steps.map((step, index) => (
                <StepItem key={index} number={index + 1} text={step} canEdit={false} />
              ))}
            </Stack>
          </Card>
        )}

        {/* Starch Preparation Section */}
        <Card sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1a2942',
              fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
              mb: { xs: 2, md: 3 },
            }}
          >
            Starch Preparation
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          >
            {recipeData.starch_preparation || 'Not applicable for this recipe.'}
          </Typography>
        </Card>

        {/* Plating Instructions Section */}
        {recipeData.plating_instructions && (
          <Card sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1a2942',
                fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                mb: { xs: 2, md: 3 },
              }}
            >
              Plating Instructions
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}
            >
              {recipeData.plating_instructions}
            </Typography>
          </Card>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            size="large"
            onClick={handleReject}
            sx={{
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
              fontWeight: 600,
              height: { xs: 48, md: 52 },
              minWidth: { xs: 120, md: 140 },
            }}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleApprove}
            sx={{
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
              fontWeight: 600,
              height: { xs: 48, md: 52 },
              minWidth: { xs: 120, md: 140 },
            }}
          >
            Approve
          </Button>
        </Box>
      </Container>
    </>
  );
}

