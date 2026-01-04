import { Helmet } from 'react-helmet-async';
import { useState, useMemo, useEffect } from 'react';
// @mui
import { Grid, Container, Stack, Typography, Box, Alert, LinearProgress, Button } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IDictionaryCategory } from '../../@types/dictionary';
// components
import { SkeletonDictionaryCategoryCard } from '../../components/skeleton';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import SearchNotFound from '../../components/search-not-found';
import Iconify from '../../components/iconify';
import { SubscriptionDialog } from '../../components/subscription-dialog';
import { useSnackbar } from '../../components/snackbar';
// sections
import { DictionaryCategoryCard, DictionarySearch, DictionaryCategoryDialog } from '../../sections/@dashboard/dictionary';
// hooks
import { useDebounce } from '../../hooks/useDebounce';
import { usePermissions } from '../../hooks/usePermissions';
import { useSubscription } from '../../hooks/useSubscription';
// auth
import PermissionGuard from '../../auth/PermissionGuard';
// services
import { useDictionaryCategories, DictionaryCategoryQueryParams, useDeleteDictionaryCategory } from '../../services';

// ----------------------------------------------------------------------

export default function DictionaryListPage() {
  const { themeStretch } = useSettingsContext();
  const { hasPermission } = usePermissions();
  const { hasSubscription } = useSubscription();
  const { enqueueSnackbar } = useSnackbar();

  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(1);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IDictionaryCategory | undefined>(undefined);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  // Debounce search input (500ms delay)
  const debouncedFilterName = useDebounce(filterName, 500);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedFilterName]);

  // Build API query params
  const queryParams: DictionaryCategoryQueryParams = useMemo(() => {
    const params: DictionaryCategoryQueryParams = {
      page,
      page_size: 12,
      ordering: '-id', // Default ordering: newest first
    };

    // Search parameter - use debounced value
    if (debouncedFilterName) {
      params.search = debouncedFilterName;
    }

    return params;
  }, [debouncedFilterName, page]);

  // Fetch dictionary categories using API
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useDictionaryCategories(queryParams);

  // Delete mutation
  const deleteMutation = useDeleteDictionaryCategory();

  // Transform API data to IDictionaryCategory format
  const dataFiltered: IDictionaryCategory[] = useMemo(() => {
    if (!data?.results) return [];
    return data.results;
  }, [data]);

  const isNotFound = !isLoading && !isError && dataFiltered.length === 0 && !!filterName;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  const handleOpenCategoryDialog = () => {
    if (!hasSubscription()) {
      setSubscriptionDialogOpen(true);
    } else {
      setEditingCategory(undefined);
      setOpenCategoryDialog(true);
    }
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setEditingCategory(undefined);
  };

  const handleCategorySuccess = () => {
    // Refetch will happen automatically via query invalidation
  };

  const handleDeleteCategory = async (category: IDictionaryCategory) => {
    try {
      await deleteMutation.mutateAsync(category.id);
      enqueueSnackbar('Category deleted successfully', { variant: 'success' });
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete category';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <>
      <Helmet>
        <title> Dictionary | PlatePrep</title>
      </Helmet>

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        message="You need an active subscription to create dictionary categories. Please subscribe to continue."
        buttonText="Subscribe Now"
        onClose={() => setSubscriptionDialogOpen(false)}
        onButtonClick={() => {
          setSubscriptionDialogOpen(false);
          window.location.href = PATH_DASHBOARD.subscription;
        }}
      />

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Dictionary"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Dictionary',
            },
          ]}
          action={
            // <PermissionGuard permission="create_dictionary_category">
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={handleOpenCategoryDialog}
                sx={{
                  fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.75, sm: 1 },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0.5, sm: 0.75 },
                    '& svg': {
                      width: { xs: 16, sm: 18, md: 20 },
                      height: { xs: 16, sm: 18, md: 20 },
                    },
                  },
                }}
              >
                Add Category
              </Button>
            // </PermissionGuard>
          }
        />

        <Stack spacing={3} sx={{ mb: 5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <DictionarySearch filterName={filterName} onFilterName={handleFilterName} />
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              }}
            >
              {data?.count || 0} {(data?.count || 0) === 1 ? 'category' : 'categories'}
            </Typography>
          </Stack>
        </Stack>

        {/* Linear Progress for fetching */}
        {isFetching && <LinearProgress />}

        {/* Error State */}
        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error instanceof Error ? error.message : 'Failed to load dictionary categories. Please try again.'}
          </Alert>
        )}

        {isLoading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid key={index} item xs={12} sm={6} md={4}>
                <SkeletonDictionaryCategoryCard />
              </Grid>
            ))}
          </Grid>
        ) : isNotFound ? (
          <SearchNotFound query={filterName} />
        ) : dataFiltered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              No categories found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Check back later for new dictionary categories.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {dataFiltered.map((category) => (
              <Grid key={category.id} item xs={12} sm={6} md={4}>
                <DictionaryCategoryCard
                  category={category}
                  onEdit={(cat) => {
                    setEditingCategory(cat);
                    setOpenCategoryDialog(true);
                  }}
                  onDelete={handleDeleteCategory}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <DictionaryCategoryDialog
          open={openCategoryDialog}
          onClose={handleCloseCategoryDialog}
          isEdit={!!editingCategory}
          currentCategory={editingCategory}
          onSuccess={handleCategorySuccess}
        />
      </Container>
    </>
  );
}

