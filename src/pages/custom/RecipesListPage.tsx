import { Helmet } from 'react-helmet-async';
import { useState, useMemo, useEffect } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
// @mui
import {
  Tab,
  Tabs,
  Card,
  Button,
  Divider,
  Container,
  Box,
  Pagination,
  Typography,
  Grid,
  Alert,
  LinearProgress,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// services
import { useRecipes, RecipeQueryParams, RecipeListResponse, useMenuCategories, useBranches } from '../../services';
// components
import Iconify from '../../components/iconify';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import { SkeletonRecipeCard } from '../../components/skeleton';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
import PermissionGuard from '../../auth/PermissionGuard';
import { usePermissions } from '../../hooks/usePermissions';
// sections
import RecipeCard from '../../sections/@dashboard/recipe/RecipeCard';
import { RecipeTableToolbar } from '../../sections/@dashboard/recipe/list';

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

const STATUS_OPTIONS = ['all', 'draft', 'active', 'private', 'archived'];

// CUISINE_OPTIONS will be populated from API

const ITEMS_PER_PAGE = 12;

// ----------------------------------------------------------------------

export default function RecipesListPage() {
  const { themeStretch } = useSettingsContext();
  const { user } = useAuthContext();
  const { hasPermission } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  // Permission-based tab visibility
  const visibleTabs = useMemo(() => {
    const canView = hasPermission('view_recipe');
    const canEdit = hasPermission('edit_recipe');
    const canDelete = hasPermission('delete_recipe');

    if (!canView) return [];

    const tabs: string[] = [];

    // If only view permission (no edit, no delete), show only active tab
    if (canView && !canEdit && !canDelete) {
      return ['active'];
    }

    // If edit permission, show all, draft, active, private
    if (canEdit) {
      tabs.push('all', 'draft', 'active', 'private');
    } else {
      // If no edit permission but has view, show only active
      tabs.push('active');
    }

    // If delete permission, add archived tab
    if (canDelete) {
      tabs.push('archived');
    }

    return tabs;
  }, [hasPermission]);

  const [filterName, setFilterName] = useState('');
  const [filterCuisine, setFilterCuisine] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState<string | number | ''>('');
  const [page, setPage] = useState(1);

  // Check if location is provided via URL query parameter
  const locationFromUrl = searchParams.get('location');
  const hasLocationInUrl = !!locationFromUrl;

  // Initialize filterBranch from URL query parameter if present
  useEffect(() => {
    if (locationFromUrl) {
      // Convert to number if it's a valid number, otherwise keep as string
      const locationValue = /^\d+$/.test(locationFromUrl) ? parseInt(locationFromUrl, 10) : locationFromUrl;
      setFilterBranch(locationValue);
    }
  }, [locationFromUrl]);

  // Fetch menu categories for cuisine filter
  const { data: menuCategories = [], isLoading: isLoadingCategories } = useMenuCategories();

  // Fetch branches to get branch name when location is in URL
  const { data: branchesData } = useBranches({
    page: 1,
    page_size: 1000,
    is_archived: false,
  });

  // Find branch name from URL location ID
  const branchNameFromUrl = useMemo(() => {
    if (!hasLocationInUrl || !locationFromUrl || !branchesData?.results) return null;
    
    const locationId = /^\d+$/.test(locationFromUrl) ? parseInt(locationFromUrl, 10) : null;
    if (!locationId) return null;
    
    const branch = branchesData.results.find((b: { id: number; branchName: string }) => b.id === locationId);
    return branch?.branchName || null;
  }, [hasLocationInUrl, locationFromUrl, branchesData]);

  // Check if user is owner to show branch filter
  const isOwner = user?.is_owner === true;
  
  // Get branch ID from user profile if not owner
  const userBranchId = user?.branch?.id;

  // Determine which branch ID to use
  // If location is in URL, use it; otherwise use normal logic
  const branchIdForApi = useMemo(() => {
    if (hasLocationInUrl && locationFromUrl) {
      // Convert to number if it's a valid number, otherwise keep as string
      return /^\d+$/.test(locationFromUrl) ? parseInt(locationFromUrl, 10) : locationFromUrl;
    }
    // If not in URL, use normal logic
    return isOwner ? (filterBranch || undefined) : userBranchId;
  }, [hasLocationInUrl, locationFromUrl, isOwner, filterBranch, userBranchId]);

  // Show branch select only if user is owner AND location is NOT in URL
  const showBranchFilter = isOwner && !hasLocationInUrl;

  // Build cuisine options from API data (no "all" option)
  const cuisineOptions = useMemo(() => {
    return menuCategories
      .filter((category) => category.categoryName)
      .map((category) => category.categoryName);
  }, [menuCategories]);

  // Find cuisine category ID from name for API
  const cuisineIdForApi = useMemo(() => {
    if (!filterCuisine) return undefined;
    
    // Find the category by name
    const category = menuCategories.find(
      (cat) => cat.categoryName.toLowerCase() === filterCuisine.toLowerCase()
    );
    return category?.id;
  }, [filterCuisine, menuCategories]);

  // Build API query params from UI filters
  const queryParams: RecipeQueryParams = useMemo(() => {
    const params: RecipeQueryParams = {
      page,
      page_size: ITEMS_PER_PAGE,
      ordering: '-id', // Default ordering: newest first
    };

    // Search parameter (global search)
    if (filterName) {
      params.search = filterName;
    }

    // Cuisine filter - send category ID to API
    if (cuisineIdForApi) {
      params.cusinie_type = String(cuisineIdForApi);
    }

    // Branch filter: use selected branch if owner, otherwise use user's branch
    if (branchIdForApi) {
      params.branch = typeof branchIdForApi === 'string' ? parseInt(branchIdForApi, 10) : branchIdForApi;
    }

    // Status filter mapping
    if (filterStatus === 'draft') {
      params.is_draft = true;
    } else if (filterStatus === 'active') {
      params.is_draft = false;
      params.status = 'P'; // Public
      params.is_deleted = false;
    } else if (filterStatus === 'private') {
      params.is_draft = false;
      params.status = 'PR'; // Private
      params.is_deleted = false;
    } else if (filterStatus === 'archived') {
      params.is_deleted = true;
    }
    // "all" - no status filter

    return params;
  }, [filterName, filterCuisine, filterStatus, filterBranch, page, branchIdForApi, cuisineIdForApi]);

  // Fetch recipes using TanStack Query
  const { data, isLoading, isFetching, isError, error } = useRecipes(queryParams) as {
    data: RecipeListResponse | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
  };

  const isFiltered = filterName !== '' || filterCuisine !== '' || filterStatus !== 'all' || (isOwner && filterBranch !== '');
  const isNotFound = !isLoading && !isError && data?.results && data.results.length === 0 && isFiltered;
  const totalPages = data?.count ? Math.ceil(data.count / ITEMS_PER_PAGE) : 0;

  const handleFilterStatus = (event: React.SyntheticEvent<Element, Event>, newValue: string) => {
    setPage(1);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setFilterName(event.target.value);
  };

  const handleFilterCuisine = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setFilterCuisine(event.target.value);
  };

  const handleFilterBranch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setFilterBranch(event.target.value);
  };

  const handleDeleteRow = (id: string) => {
    // Delete will be handled by the delete mutation hook
    // This is just for UI feedback - actual deletion should use useDeleteRecipe hook
    console.log('Delete recipe:', id);
  };

  const handleRecoverRow = (id: string) => {
    // Recover will be handled by the recover mutation hook
    // This is just for UI feedback - actual recovery should use useRecoverRecipe hook
    console.log('Recover recipe:', id);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterCuisine('');
    // Reset to first visible tab or 'active' if no tabs visible
    setFilterStatus(visibleTabs.length > 0 ? visibleTabs[0] : 'active');
    setFilterBranch('');
    setPage(1);
  };

  // Ensure current filterStatus is valid based on permissions
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.includes(filterStatus)) {
      // If current status is not in visible tabs, switch to first visible tab
      setFilterStatus(visibleTabs[0]);
      setPage(1);
    }
  }, [visibleTabs, filterStatus]);

  return (
    <>
      <Helmet>
        <title> Recipe: List | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Recipe List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Recipes', href: PATH_DASHBOARD.recipes.root },
            { name: 'List' },
          ]}
          action={
            <PermissionGuard permission="create_recipe">
              <Button
                component={RouterLink}
                to={PATH_DASHBOARD.recipes.new}
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
              >
                New Recipe
              </Button>
            </PermissionGuard>
          }
        />

        <PermissionGuard permission="view_recipe">
          <Card sx={{ mb: { xs: 2, md: 3 } }}>
            <Tabs
              value={filterStatus}
              onChange={handleFilterStatus}
              sx={{
                px: { xs: 1.5, sm: 2 },
                bgcolor: 'background.neutral',
                '& .MuiTab-root': {
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  fontWeight: 600,
                  minHeight: { xs: 44, md: 48 },
                },
              }}
            >
              {visibleTabs.map((tab) => (
                <Tab key={tab} label={tab} value={tab} sx={{ textTransform: 'capitalize' }} />
              ))}
            </Tabs>

            <Divider />

            <RecipeTableToolbar
              isFiltered={isFiltered}
              filterName={filterName}
              filterCuisine={filterCuisine}
              filterBranch={filterBranch}
              optionsCuisine={cuisineOptions}
              isLoadingCuisine={isLoadingCategories}
              showBranchFilter={showBranchFilter}
              onFilterName={handleFilterName}
              onFilterCuisine={handleFilterCuisine}
              onFilterBranch={handleFilterBranch}
              onResetFilter={handleResetFilter}
              formInputSx={FORM_INPUT_SX}
            />
          </Card>
        </PermissionGuard>

          {/* Subtle loading indicator for background refetching */}
          {isFetching && !isLoading && (
            <LinearProgress
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1100,
                height: 2,
                mb: 2,
              }}
            />
          )}

        <PermissionGuard permission="view_recipe">
          {isLoading ? (
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                  <SkeletonRecipeCard />
                </Grid>
              ))}
            </Grid>
          ) : isError ? (
            <Box sx={{ py: { xs: 6, md: 10 } }}>
              <Alert severity="error">
                {error instanceof Error ? error.message : 'Failed to load recipes. Please try again.'}
              </Alert>
            </Box>
          ) : isNotFound ? (
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                paragraph
                sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }, fontWeight: 700 }}
              >
                No results found
              </Typography>

              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' } }}
              >
                No recipes match your search criteria.&nbsp;
                <Box 
                  component="span" 
                  sx={{ 
                    color: 'primary.main', 
                    cursor: 'pointer',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }} 
                  onClick={handleResetFilter}
                >
                  Try resetting filters
                </Box>
              </Typography>
            </Box>
          ) : data && data.results.length > 0 ? (
            <>
              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {data.results.map((recipe) => (
                  <Grid key={recipe.id} item xs={12} sm={6} md={4} lg={3}>
                    <RecipeCard 
                      recipe={recipe} 
                      onDelete={() => handleDeleteRow(recipe.id)}
                      onRecover={() => handleRecoverRow(recipe.id)}
                      filterStatus={filterStatus}
                      canEdit={hasPermission('edit_recipe')}
                      canDelete={hasPermission('delete_recipe')}
                      canArchive={hasPermission('delete_recipe')}
                    />
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ mt: { xs: 4, md: 5 }, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                paragraph
                sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }, fontWeight: 700 }}
              >
                No recipes found
              </Typography>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' } }}
              >
                Get started by creating a new recipe.
              </Typography>
            </Box>
          )}
        </PermissionGuard>
      </Container>
    </>
  );
}

