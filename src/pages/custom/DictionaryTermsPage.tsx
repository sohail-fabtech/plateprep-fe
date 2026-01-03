import { Helmet } from 'react-helmet-async';
import { useState, useMemo, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
// @mui
import { Grid, Container, Stack, Typography, Box, Button, Alert, LinearProgress, CircularProgress } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IDictionaryTerm } from '../../@types/dictionary';
// components
import { SkeletonDictionaryTermCard } from '../../components/skeleton';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import SearchNotFound from '../../components/search-not-found';
import Iconify from '../../components/iconify';
// sections
import { DictionaryTermCard, DictionarySearch, DictionaryItemDialog } from '../../sections/@dashboard/dictionary';
// hooks
import { useDebounce } from '../../hooks/useDebounce';
import { usePermissions } from '../../hooks/usePermissions';
import { useSubscription } from '../../hooks/useSubscription';
// auth
import PermissionGuard from '../../auth/PermissionGuard';
// components
import { SubscriptionDialog } from '../../components/subscription-dialog';
// services
import { useDictionaryCategory, useDictionaryItems, DictionaryItemQueryParams } from '../../services';

// ----------------------------------------------------------------------

export default function DictionaryTermsPage() {
  const { themeStretch } = useSettingsContext();
  const { hasPermission } = usePermissions();
  const { hasSubscription } = useSubscription();

  const { categoryId } = useParams<{ categoryId: string }>();

  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(1);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<IDictionaryTerm | undefined>(undefined);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  // Debounce search input (500ms delay)
  const debouncedFilterName = useDebounce(filterName, 500);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedFilterName]);

  // Fetch category details
  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    isError: isErrorCategory,
    error: categoryError,
  } = useDictionaryCategory(categoryId ? Number(categoryId) : undefined);

  // Build API query params for dictionary items
  const queryParams: DictionaryItemQueryParams = useMemo(() => {
    const params: DictionaryItemQueryParams = {
      page,
      page_size: 12,
      ordering: '-id', // Default ordering: newest first
    };

    // Category filter - required
    if (categoryId) {
      params.category = Number(categoryId);
    }

    // Search parameter - use debounced value
    if (debouncedFilterName) {
      params.search = debouncedFilterName;
    }

    return params;
  }, [categoryId, debouncedFilterName, page]);

  // Fetch dictionary items using API
  const {
    data: itemsData,
    isLoading: isLoadingItems,
    isFetching: isFetchingItems,
    isError: isErrorItems,
    error: itemsError,
  } = useDictionaryItems(queryParams);

  // Transform API data to IDictionaryTerm format
  const dataFiltered: IDictionaryTerm[] = useMemo(() => {
    if (!itemsData?.results) return [];
    return itemsData.results;
  }, [itemsData]);

  const isLoading = isLoadingCategory || isLoadingItems;
  const isError = isErrorCategory || isErrorItems;
  const error = categoryError || itemsError;

  const isNotFound = !isLoading && !isError && dataFiltered.length === 0 && !!filterName;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  const handleOpenItemDialog = () => {
    if (!hasSubscription()) {
      setSubscriptionDialogOpen(true);
    } else {
      setEditingItem(undefined);
      setOpenItemDialog(true);
    }
  };

  const handleCloseItemDialog = () => {
    setOpenItemDialog(false);
    setEditingItem(undefined);
  };

  const handleItemSuccess = () => {
    // Refetch will happen automatically via query invalidation
  };

  // Show loading state for category
  if (isLoadingCategory) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Show error state for category
  if (isErrorCategory || !categoryData) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {categoryError instanceof Error ? categoryError.message : 'Failed to load category. Please try again.'}
          </Alert>
          <Button component={RouterLink} to={PATH_DASHBOARD.dictionary.root} variant="contained">
            Back to Dictionary
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${categoryData.name} - Dictionary | PlatePrep`}</title>
      </Helmet>

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        message="You need an active subscription to create dictionary terms. Please subscribe to continue."
        buttonText="Subscribe Now"
        onClose={() => setSubscriptionDialogOpen(false)}
        onButtonClick={() => {
          setSubscriptionDialogOpen(false);
          window.location.href = PATH_DASHBOARD.subscription;
        }}
      />

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={categoryData.name}
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Dictionary',
              href: PATH_DASHBOARD.dictionary.root,
            },
            {
              name: categoryData.name,
            },
          ]}
          action={
            <Stack direction="row" spacing={2}>
              <PermissionGuard permission="create_dictionary_item">
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={handleOpenItemDialog}
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
                  Add Term
                </Button>
              </PermissionGuard>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                component={RouterLink}
                to={PATH_DASHBOARD.dictionary.root}
                sx={{
                  fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.75, sm: 1 },
                }}
              >
                Back to Categories
              </Button>
            </Stack>
          }
        />

        {categoryData.description && (
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {categoryData.description}
            </Typography>
          </Stack>
        )}

        <Stack spacing={3} sx={{ mb: 5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <DictionarySearch filterName={filterName} onFilterName={handleFilterName} placeholder="Search terms..." />
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              }}
            >
              {itemsData?.count || 0} {(itemsData?.count || 0) === 1 ? 'term' : 'terms'}
            </Typography>
          </Stack>
        </Stack>

        {/* Linear Progress for fetching */}
        {isFetchingItems && <LinearProgress />}

        {/* Error State */}
        {isErrorItems && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {itemsError instanceof Error ? itemsError.message : 'Failed to load dictionary terms. Please try again.'}
          </Alert>
        )}

        {isLoadingItems ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid key={index} item xs={12} md={6}>
                <SkeletonDictionaryTermCard />
              </Grid>
            ))}
          </Grid>
        ) : isNotFound ? (
          <SearchNotFound query={filterName} />
        ) : dataFiltered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              No terms found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              This category doesn't have any terms yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {dataFiltered.map((term) => (
              <Grid key={term.id} item xs={12} md={6}>
                <DictionaryTermCard term={term} />
              </Grid>
            ))}
          </Grid>
        )}

        <DictionaryItemDialog
          open={openItemDialog}
          onClose={handleCloseItemDialog}
          isEdit={!!editingItem}
          currentItem={editingItem}
          categoryId={categoryId ? Number(categoryId) : undefined}
          onSuccess={handleItemSuccess}
        />
      </Container>
    </>
  );
}

