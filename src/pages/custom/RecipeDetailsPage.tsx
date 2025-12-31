import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
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
  IconButton,
  ButtonGroup,
  Tooltip,
  CircularProgress,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// _mock_
import { _recipeList } from '../../_mock/arrays';
// @types
import { IRecipe } from '../../@types/recipe';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';
import Image from '../../components/image';
import { fCurrency } from '../../utils/formatNumber';
import { useSnackbar } from '../../components/snackbar';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// utils
import { fetchRecipeById, saveRecipe } from '../../utils/recipeAdapter';
// sections
import {
  IngredientItem,
  StepItem,
  CommentItem,
  WinePairingCard,
  InfoCard,
  EditableIngredientItem,
  EditableStepItem,
  EditableCommentItem,
  EditableWinePairingCard,
} from '../../sections/@dashboard/recipe/details';
import EditableField from '../../sections/@dashboard/recipe/EditableField';

// ----------------------------------------------------------------------

// Consistent form input styling
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

// Options for dropdowns
const CENTER_OF_PLATE_OPTIONS = ['Beans / Legumes', 'Beef', 'Pork', 'Chicken', 'Seafood', 'Lamb', 'Vegetable'];

export default function RecipeDetailsPage() {
  const { id } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [servings, setServings] = useState(1);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [recipeData, setRecipeData] = useState<IRecipe | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has edit permission (e.g., admin or manager role)
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  // Fetch recipe data from API
  useEffect(() => {
    async function loadRecipe() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API first
        // If API is not available, fall back to mock data
        try {
          const recipe = await fetchRecipeById(id);
          setRecipeData(recipe);
        } catch (apiError) {
          console.warn('API not available, using mock data:', apiError);
          // Fallback to mock data
          const foundRecipe = _recipeList.find((item) => item.id === id);
          if (foundRecipe) {
            setRecipeData(foundRecipe);
          } else {
            setError('Recipe not found');
          }
        }
      } catch (err) {
        console.error('Error loading recipe:', err);
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

  // Handle field edit - MUST be before any conditional returns (Rules of Hooks)
  const handleFieldEdit = useCallback((fieldName: string) => {
    setEditingField(fieldName);
  }, []);

  // Handle field save - MUST be before any conditional returns (Rules of Hooks)
  const handleFieldSave = useCallback(async (fieldName: string, value: any) => {
    // 📊 ENTERPRISE LOGGING - Track all field changes for API integration
    console.group('✏️ [FIELD EDIT INITIATED]');
    console.log('Field Name:', fieldName);
    console.log('New Value:', value);
    console.log('Recipe ID:', recipeData?.id);
    console.log('Recipe Name:', recipeData?.dishName);
    console.log('Timestamp:', new Date().toISOString());
    console.log('User:', user?.email || 'Unknown');
    console.groupEnd();

    try {
      setRecipeData((prev) => {
        if (!prev) return prev;
        
        // Handle nested properties
        if (fieldName.includes('.')) {
          const keys = fieldName.split('.');
          const updated = { ...prev };
          let current: any = updated;
          
          // Navigate to parent
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
          }
          
          // Set final value
          current[keys[keys.length - 1]] = value;
          return updated;
        }
        
        return { ...prev, [fieldName]: value };
      });
      
      setEditingField(null);
      
      // Save to API
      if (recipeData) {
        const updatedFields: Partial<IRecipe> = {
          id: recipeData.id,
        };
        
        // Set the updated field
        if (fieldName.includes('.')) {
          const keys = fieldName.split('.');
          if (keys[0] === 'plateDesign' && keys.length === 3) {
            updatedFields.plateDesign = {
              centerOfPlate: {
                category: recipeData.plateDesign?.centerOfPlate?.category || '',
                subcategory: recipeData.plateDesign?.centerOfPlate?.subcategory || '',
                [keys[2]]: value,
              },
              platingSteps: recipeData.plateDesign?.platingSteps || [],
            };
          } else if (keys[0] === 'costing') {
            updatedFields.costing = {
              ...recipeData.costing,
              [keys[1]]: value,
            };
          }
        } else {
          (updatedFields as any)[fieldName] = value;
        }
        
        // Call API to save (will use mock for now if API not available)
        try {
          console.log('📤 [API SAVE ATTEMPT]', {
            endpoint: `/api/recipes/${recipeData.id}/`,
            method: 'PATCH',
            payload: updatedFields,
            timestamp: new Date().toISOString(),
          });
          
          await saveRecipe(updatedFields, 'PATCH');
          
          console.log('✅ [API SAVE SUCCESS]', {
            fieldName,
            value,
            recipeId: recipeData.id,
            timestamp: new Date().toISOString(),
          });
          
          enqueueSnackbar('Field updated successfully!', { variant: 'success' });
        } catch (apiError) {
          console.warn('⚠️ [API SAVE FAILED - Using Local State]', {
            error: apiError,
            fieldName,
            value,
            fallbackMode: 'local',
            timestamp: new Date().toISOString(),
          });
          enqueueSnackbar('Field updated locally (API unavailable)', { variant: 'warning' });
        }
      }
    } catch (error) {
      console.error('❌ [FIELD SAVE ERROR]', {
        error,
        fieldName,
        value,
        timestamp: new Date().toISOString(),
      });
      enqueueSnackbar('Failed to update field', { variant: 'error' });
    }
  }, [recipeData, enqueueSnackbar, user]);

  // Handle field cancel - MUST be before any conditional returns (Rules of Hooks)
  const handleFieldCancel = useCallback(() => {
    setEditingField(null);
  }, []);

  // Handle ingredient save
  const handleIngredientSave = useCallback((id: string, data: { name: string; quantity: string; unit?: string }) => {
    setRecipeData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients?.map((ing) =>
          ing.id === id ? { ...ing, title: data.name, quantity: parseFloat(data.quantity), unit: data.unit || '' } : ing
        ),
      };
    });
    enqueueSnackbar('Ingredient updated successfully!', { variant: 'success' });
    console.log('💾 [INGREDIENT SAVED]', { id, data, timestamp: new Date().toISOString() });
  }, [enqueueSnackbar]);

  // Handle essential save
  const handleEssentialSave = useCallback((id: string, data: { name: string; quantity: string; unit?: string }) => {
    setRecipeData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        essentialIngredients: prev.essentialIngredients?.map((ess) =>
          ess.id === id ? { ...ess, title: data.name, quantity: parseFloat(data.quantity) } : ess
        ),
      };
    });
    enqueueSnackbar('Essential ingredient updated successfully!', { variant: 'success' });
    console.log('💾 [ESSENTIAL SAVED]', { id, data, timestamp: new Date().toISOString() });
  }, [enqueueSnackbar]);

  // Handle step save
  const handleStepSave = useCallback((id: string, data: { text: string }) => {
    setRecipeData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps?.map((step) =>
          step.id === id ? { ...step, description: data.text } : step
        ),
      };
    });
    enqueueSnackbar('Step updated successfully!', { variant: 'success' });
    console.log('💾 [STEP SAVED]', { id, data, timestamp: new Date().toISOString() });
  }, [enqueueSnackbar]);

  // Handle starch step save
  const handleStarchStepSave = useCallback((id: string, data: { text: string }) => {
    setRecipeData((prev) => {
      if (!prev ||!prev.starchPreparation) return prev;
      return {
        ...prev,
        starchPreparation: {
          ...prev.starchPreparation,
          steps: prev.starchPreparation.steps?.map((step) =>
            step.id === id ? { ...step, description: data.text } : step
          ),
        },
      };
    });
    enqueueSnackbar('Starch step updated successfully!', { variant: 'success' });
    console.log('💾 [STARCH STEP SAVED]', { id, data, timestamp: new Date().toISOString() });
  }, [enqueueSnackbar]);

  // Handle plate design step save
  const handlePlateDesignStepSave = useCallback((id: string, data: { text: string }) => {
    setRecipeData((prev) => {
      if (!prev || !prev.plateDesign) return prev;
      return {
        ...prev,
        plateDesign: {
          ...prev.plateDesign,
          platingSteps: prev.plateDesign.platingSteps?.map((step) =>
            step.id === id ? { ...step, description: data.text } : step
          ),
        },
      };
    });
    enqueueSnackbar('Plate design step updated successfully!', { variant: 'success' });
    console.log('💾 [PLATE DESIGN STEP SAVED]', { id, data, timestamp: new Date().toISOString() });
  }, [enqueueSnackbar]);

  // Handle cooking deviation comment save
  const handleCookingCommentSave = useCallback((id: string, data: { text: string }) => {
    setRecipeData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cookingDeviationComments: prev.cookingDeviationComments?.map((comment) =>
          comment.id === id ? { ...comment, step: data.text } : comment
        ),
      };
    });
    enqueueSnackbar('Cooking deviation comment updated successfully!', { variant: 'success' });
    console.log('💾 [COOKING COMMENT SAVED]', { id, data, timestamp: new Date().toISOString() });
  }, [enqueueSnackbar]);

  // Handle realtime comment save
  const handleRealtimeCommentSave = useCallback((id: string, data: { text: string }) => {
    setRecipeData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        realtimeVariableComments: prev.realtimeVariableComments?.map((comment) =>
          comment.id === id ? { ...comment, step: data.text } : comment
        ),
      };
    });
    enqueueSnackbar('Realtime variable comment updated successfully!', { variant: 'success' });
    console.log('💾 [REALTIME COMMENT SAVED]', { id, data, timestamp: new Date().toISOString() });
  }, [enqueueSnackbar]);

  // Handle wine pairing save
  const handleWinePairingSave = useCallback((id: string, data: {
    name: string;
    type: string;
    flavor: string;
    profile: string;
    description: string;
    proteins: string;
    region: string;
  }) => {
    setRecipeData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        winePairings: prev.winePairings?.map((wine) =>
          wine.id === id ? {
            ...wine,
            wine_name: data.name,
            wine_type: data.type,
            flavor: data.flavor,
            profile: data.profile,
            reason_for_pairing: data.description,
            proteins: data.proteins,
            region_name: data.region,
          } : wine
        ),
      };
    });
    enqueueSnackbar('Wine pairing updated successfully!', { variant: 'success' });
    console.log('💾 [WINE PAIRING SAVED]', { id, data, timestamp: new Date().toISOString() });
  }, [enqueueSnackbar]);

  const recipe = recipeData;

  // Loading state - AFTER all hooks
  if (loading) {
    return (
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state - AFTER all hooks
  if (error || !recipe) {
    return (
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || 'Recipe not found'}
          </Typography>
          <Button
            component={RouterLink}
            to={PATH_DASHBOARD.recipes.list}
            variant="contained"
            sx={{ mt: 3 }}
          >
            Back to List
          </Button>
        </Box>
      </Container>
    );
  }

  const handleIncrementServings = () => {
    setServings((prev) => prev + 1);
  };

  const handleDecrementServings = () => {
    setServings((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <>
      <Helmet>
        <title>{`${recipe.dishName} | Recipe Details`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        {/* Breadcrumbs */}
        <CustomBreadcrumbs
          heading="Recipe Details"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Recipes', href: PATH_DASHBOARD.recipes.list },
            { name: recipe.dishName },
          ]}
          sx={{ mb: { xs: 3, md: 4 } }}
          action={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {canEdit && (
                <Tooltip title="Edit all fields in full editor">
                  <Button
                    component={RouterLink}
                    to={PATH_DASHBOARD.recipes.edit(recipe.id)}
                    variant="outlined"
                    startIcon={<Iconify icon="eva:edit-fill" />}
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                      height: { xs: 36, sm: 40, md: 42 },
                    }}
                  >
                    Full Edit Mode
                  </Button>
                </Tooltip>
              )}
              <Button
                component={RouterLink}
                to={PATH_DASHBOARD.recipes.list}
                variant="contained"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                  height: { xs: 36, sm: 40, md: 42 },
                }}
              >
                Back to List
              </Button>
            </Stack>
          }
        />

        {/* Hero Section */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: 4, md: 6 } }}>
          {/* Left: Image */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: { xs: 3, md: 4 },
                overflow: 'hidden',
                boxShadow: theme.customShadows.z16,
                bgcolor: '#d4c5b0',
              }}
            >
              <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                <Image
                  src={recipe.imageFiles[0] || '/assets/images/placeholder.jpg'}
                  alt={recipe.dishName}
                  ratio="1/1"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    width: 1,
                    height: 1,
                  }}
                />
              </Box>
            </Card>
          </Grid>

          {/* Right: Info */}
          <Grid item xs={12} md={6}>
            <Stack spacing={{ xs: 2, md: 3 }}>
              {/* Editable Title */}
              <Box>
                <EditableField
                  label="Dish Name"
                  value={recipe.dishName}
                  type="text"
                  canEdit={canEdit}
                  isEditing={editingField === 'dishName'}
                  onEdit={() => handleFieldEdit('dishName')}
                  onSave={(value) => handleFieldSave('dishName', value)}
                  onCancel={handleFieldCancel}
                  placeholder="Enter dish name..."
                />
              </Box>

              {/* Editable Description */}
              <Box>
                <EditableField
                  label="Description"
                  value={recipe.description || 'This is Description section'}
                  type="multiline"
                  canEdit={canEdit}
                  isEditing={editingField === 'description'}
                  onEdit={() => handleFieldEdit('description')}
                  onSave={(value) => handleFieldSave('description', value)}
                  onCancel={handleFieldCancel}
                  placeholder="Enter recipe description..."
                />
              </Box>

              {/* Info Cards Grid - Some Editable */}
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, height: '100%', bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                      <EditableField
                        label="Cuisine Type"
                        value={recipe.cuisineType}
                        type="text"
                        canEdit={canEdit}
                        isEditing={editingField === 'cuisineType'}
                        onEdit={() => handleFieldEdit('cuisineType')}
                        onSave={(value) => handleFieldSave('cuisineType', value)}
                        onCancel={handleFieldCancel}
                      />
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, height: '100%', bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                      <EditableField
                        label="Prep Time (minutes)"
                        value={recipe.preparationTime}
                        type="number"
                        canEdit={canEdit}
                        isEditing={editingField === 'preparationTime'}
                        onEdit={() => handleFieldEdit('preparationTime')}
                        onSave={(value) => handleFieldSave('preparationTime', value)}
                        onCancel={handleFieldCancel}
                      />
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, height: '100%', bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                      <EditableField
                        label="Dish Type (Center of Plate)"
                        value={recipe.plateDesign?.centerOfPlate?.category || 'Beef'}
                        type="select"
                        options={CENTER_OF_PLATE_OPTIONS}
                        canEdit={canEdit}
                        isEditing={editingField === 'plateDesign.centerOfPlate.category'}
                        onEdit={() => handleFieldEdit('plateDesign.centerOfPlate.category')}
                        onSave={(value) => handleFieldSave('plateDesign.centerOfPlate.category', value)}
                        onCancel={handleFieldCancel}
                      />
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, height: '100%', bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                      <EditableField
                        label="Station"
                        value={recipe.station}
                        type="text"
                        canEdit={canEdit}
                        isEditing={editingField === 'station'}
                        onEdit={() => handleFieldEdit('station')}
                        onSave={(value) => handleFieldSave('station', value)}
                        onCancel={handleFieldCancel}
                      />
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Financial Overview */}
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: { xs: 2, md: 3 },
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, md: 3 } }}>
                  <Iconify icon="mdi:currency-usd" width={{ xs: 18, md: 20 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
                    }}
                  >
                    Financial Overview
                  </Typography>
                </Box>

                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: theme.palette.text.disabled,
                        letterSpacing: 1,
                        fontSize: { xs: '0.625rem', md: '0.65rem' },
                      }}
                    >
                      Food Cost
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mt: 0.5,
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                      }}
                    >
                      {fCurrency(recipe.foodCost)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: theme.palette.text.disabled,
                        letterSpacing: 1,
                        fontSize: { xs: '0.625rem', md: '0.65rem' },
                      }}
                    >
                      Per Serving
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mt: 0.5,
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                      }}
                    >
                      {fCurrency(recipe.costing.costPerServing)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: theme.palette.text.disabled,
                        letterSpacing: 1,
                        fontSize: { xs: '0.625rem', md: '0.65rem' },
                      }}
                    >
                      Sale Price
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mt: 0.5,
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                      }}
                    >
                      {fCurrency(recipe.costing.salePrice)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: { xs: 2, md: 2.5 } }} />

                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: theme.palette.text.disabled,
                        letterSpacing: 1,
                        fontSize: { xs: '0.625rem', md: '0.65rem' },
                      }}
                    >
                      Food Cost %
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#1a2942',
                        mt: 0.5,
                        fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
                      }}
                    >
                      {recipe.costing.foodCostPct}%
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: theme.palette.text.disabled,
                        letterSpacing: 1,
                        fontSize: { xs: '0.625rem', md: '0.65rem' },
                      }}
                    >
                      Servings/Case
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#1a2942',
                        mt: 0.5,
                        fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
                      }}
                    >
                      16
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Tags */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, md: 1.5 } }}>
                {recipe.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    sx={{
                      borderRadius: 7,
                      bgcolor: alpha(theme.palette.grey[500], 0.12),
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                      height: { xs: 28, md: 32 },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.grey[500], 0.16),
                      },
                    }}
                  />
                ))}
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Ingredients & Essential Tools */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: 4, md: 6 } }}>
          {/* Ingredients */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: { xs: 2, md: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a2942',
                  fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                }}
              >
                Ingredients
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  }}
                >
                  Servings
                </Typography>
                <ButtonGroup
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                    borderRadius: { xs: 1.5, md: 2 },
                    '& .MuiButtonGroup-grouped': {
                      border: 'none',
                      minWidth: { xs: 36, md: 40 },
                    },
                  }}
                >
                  <IconButton onClick={handleDecrementServings} size="small">
                    <Iconify icon="eva:minus-fill" width={{ xs: 16, md: 18 }} />
                  </IconButton>
                  <Box
                    sx={{
                      px: { xs: 1.5, md: 2 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: { xs: 44, md: 50 },
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                      }}
                    >
                      {servings}
                    </Typography>
                  </Box>
                  <IconButton onClick={handleIncrementServings} size="small">
                    <Iconify icon="eva:plus-fill" width={{ xs: 16, md: 18 }} />
                  </IconButton>
                </ButtonGroup>
              </Box>
            </Box>

            <Stack spacing={{ xs: 1.25, md: 1.5 }}>
              {recipe.ingredients?.map((ing, index) => (
                <EditableIngredientItem
                  key={ing.id || index}
                  id={ing.id}
                  name={ing.title}
                  quantity={String(ing.quantity)}
                  unit={ing.unit}
                  canEdit={canEdit}
                  onSave={handleIngredientSave}
                />
              )) || [
                <EditableIngredientItem key={1} name="Ingredient 3" quantity="1" unit="Chop" canEdit={false} />,
                <EditableIngredientItem key={2} name="Ingredient 2" quantity="2" unit="Bar" canEdit={false} />,
                <EditableIngredientItem key={3} name="Ingredient 1" quantity="4" unit="Amount" canEdit={false} />,
              ]}
            </Stack>
          </Grid>

          {/* Essential Tools */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, md: 1.5 }, mb: { xs: 2, md: 3 } }}>
              <Iconify icon="mdi:tools" width={{ xs: 20, md: 24 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a2942',
                  fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.25rem' },
                  flex: 1,
                }}
              >
                Essential Tools
              </Typography>
            </Box>

            <Stack spacing={{ xs: 1.25, md: 1.5 }}>
              {recipe.essentialIngredients?.map((essential, index) => (
                <EditableIngredientItem
                  key={essential.id || index}
                  id={essential.id}
                  name={essential.title}
                  quantity={String(essential.quantity)}
                  canEdit={canEdit}
                  onSave={handleEssentialSave}
                />
              )) || [
                <EditableIngredientItem key={1} name="Essential 3" quantity="1" canEdit={false} />,
                <EditableIngredientItem key={2} name="Essential 2" quantity="1" canEdit={false} />,
                <EditableIngredientItem key={3} name="Essential 1" quantity="1" canEdit={false} />,
              ]}
            </Stack>
          </Grid>
        </Grid>

        {/* Starch Title */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#1a2942',
              fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
              mb: { xs: 2, md: 3 },
            }}
          >
            {recipe.starchPreparation?.type || 'Starch Title'}
          </Typography>

          <Stack spacing={{ xs: 1.25, md: 1.5 }}>
            {recipe.starchPreparation?.steps?.map((step, index) => (
              <EditableStepItem
                key={step.id || index}
                id={step.id}
                number={step.stepNumber || index + 1}
                text={step.description}
                canEdit={canEdit}
                onSave={handleStarchStepSave}
              />
            )) || [
              <EditableStepItem key={1} number={1} text="Starch 3" canEdit={false} />,
              <EditableStepItem key={2} number={2} text="Starch 2" canEdit={false} />,
              <EditableStepItem key={3} number={3} text="Starch 1" canEdit={false} />,
            ]}
          </Stack>
        </Box>

        {/* Preparation Steps */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
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

          <Stack spacing={{ xs: 1.25, md: 1.5 }}>
            {recipe.steps?.map((step, index) => (
              <EditableStepItem
                key={step.id || index}
                id={step.id}
                number={step.stepNumber || index + 1}
                text={step.description}
                canEdit={canEdit}
                onSave={handleStepSave}
              />
            )) || [
              <EditableStepItem key={1} number={1} text="Step 1" canEdit={false} />,
              <EditableStepItem key={2} number={2} text="Step 2" canEdit={false} />,
              <EditableStepItem key={3} number={3} text="Step 3" canEdit={false} />,
              <EditableStepItem key={4} number={4} text="Step 4" canEdit={false} />,
            ]}
          </Stack>
        </Box>

        {/* Predefined Lists */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: 4, md: 6 } }}>
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: '#1a2942', 
                mb: { xs: 2, md: 2.5 },
                fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.25rem' },
              }}
            >
              Predefined Ingredients
            </Typography>

            <Stack spacing={{ xs: 1.25, md: 1.5 }}>
              <Box sx={{ display: 'flex', gap: { xs: 0.75, md: 1 } }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  }}
                >
                  •
                </Typography>
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                    }}
                  >
                    Bisque (shellfish){' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ 
                        color: theme.palette.text.disabled,
                        fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                      }}
                    >
                      (Soups, Broths & Stocks)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: { xs: 0.75, md: 1 } }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  }}
                >
                  •
                </Typography>
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                    }}
                  >
                    Beef Stock{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ 
                        color: theme.palette.text.disabled,
                        fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                      }}
                    >
                      (Soups, Broths & Stocks)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: { xs: 0.75, md: 1 } }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  }}
                >
                  •
                </Typography>
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                    }}
                  >
                    Blue Cheese Dressing{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      (Dressings & Vinaigrettes)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  •
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Beurre Blanc{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      (Classic Sauces & Reductions)
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: '#1a2942', 
                mb: { xs: 2, md: 2.5 },
                fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.25rem' },
              }}
            >
              Predefined Starch
            </Typography>

            <Stack spacing={{ xs: 1.25, md: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  •
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Bread Basket / Artisan Rolls (if served with butter){' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      (Other)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  •
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Bread Pudding (savory){' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      (Other)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  •
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Arroz con Gandules / Spanish-Style Rice{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      (Rice-Based)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  •
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Brown Rice{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      (Rice-Based)
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: '#1a2942', 
                mb: { xs: 2, md: 2.5 },
                fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.25rem' },
              }}
            >
              Predefined Vegetables
            </Typography>

            <Stack spacing={{ xs: 1.25, md: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  •
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Acorn Squash (roasted, stuffed){' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      (Seasonal / Specialty)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  •
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Artichokes (braised, grilled, fried){' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      (Seasonal / Specialty)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  •
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Beets (roasted, pickled, puréed){' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      (Root Vegetables)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  •
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Asparagus{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      (grilled, roasted, blanched)
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Design Your Plate */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Iconify icon="mdi:star" width={24} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2942', flex: 1 }}>
              Design Your Plate
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            {recipe.plateDesign?.platingSteps?.map((step, index) => (
              <EditableStepItem
                key={step.id || index}
                id={step.id}
                number={step.stepNumber || index + 1}
                text={step.description}
                canEdit={canEdit}
                onSave={handlePlateDesignStepSave}
              />
            )) || [
              <EditableStepItem key={1} number={1} text="Design Your Plate 2" canEdit={false} />,
              <EditableStepItem key={2} number={2} text="Design Your Plate 1" canEdit={false} />,
            ]}
          </Stack>
        </Box>

        {/* Comments Sections */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Iconify icon="mdi:clock-outline" width={22} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a2942', flex: 1 }}>
                Cooking Deviation Comments
              </Typography>
            </Box>

            <Stack spacing={1.5}>
              {recipe.cookingDeviationComments?.map((comment, index) => (
                <EditableCommentItem
                  key={comment.id || index}
                  id={comment.id}
                  text={comment.step}
                  canEdit={canEdit}
                  onSave={handleCookingCommentSave}
                />
              )) || [
                <EditableCommentItem key={1} text="Cooking Deviation Comment 4" canEdit={false} />,
                <EditableCommentItem key={2} text="Cooking Deviation Comment 3" canEdit={false} />,
                <EditableCommentItem key={3} text="Cooking Deviation Comment 2" canEdit={false} />,
                <EditableCommentItem key={4} text="Cooking Deviation Comment 1" canEdit={false} />,
              ]}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Iconify icon="mdi:message-text-outline" width={22} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a2942', flex: 1 }}>
                Real-time Variable Comments
              </Typography>
            </Box>

            <Stack spacing={1.5}>
              {recipe.realtimeVariableComments?.map((comment, index) => (
                <EditableCommentItem
                  key={comment.id || index}
                  id={comment.id}
                  text={comment.step}
                  canEdit={canEdit}
                  onSave={handleRealtimeCommentSave}
                />
              )) || [
                <EditableCommentItem key={1} text="Real-time Variable Comment 2" canEdit={false} />,
                <EditableCommentItem key={2} text="Real-time Variable Comment 1" canEdit={false} />,
              ]}
            </Stack>
          </Grid>
        </Grid>

        {/* Wine Pairings */}
        {(recipe.winePairings && recipe.winePairings.length > 0) && (
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <Iconify icon="mdi:glass-wine" width={24} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2942' }}>
                Wine Pairings
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {recipe.winePairings.map((wine, index) => (
                <Grid item xs={12} md={6} key={wine.id || index}>
                  <EditableWinePairingCard
                    wine={{
                      id: wine.id,
                      name: wine.wine_name,
                      type: wine.wine_type,
                      country: wine.region_name,
                      flavor: wine.flavor,
                      profile: wine.profile,
                      region: wine.region_name,
                      proteins: wine.proteins,
                      description: wine.reason_for_pairing,
                      proteinTag: wine.proteins,
                    }}
                    canEdit={canEdit}
                    onSave={handleWinePairingSave}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Recipe Video Tutorial */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Iconify icon="mdi:play-circle" width={24} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2942' }}>
              Recipe Video Tutorial
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: theme.customShadows.z8,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '56.25%', // 16:9 aspect ratio
                    bgcolor: alpha(theme.palette.grey[500], 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      border: 'none',
                    }}
                    src={`https://www.youtube.com/embed/${recipe.youtubeUrl?.split('v=')[1] || 'dQw4w9WgXcQ'}`}
                    title="Recipe Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: theme.customShadows.z8,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '56.25%',
                    bgcolor: alpha(theme.palette.grey[500], 0.12),
                  }}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      border: 'none',
                    }}
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Recipe Video 2"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
