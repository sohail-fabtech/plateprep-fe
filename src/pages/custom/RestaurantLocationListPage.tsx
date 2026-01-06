import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import {
  Tab,
  Tabs,
  Card,
  Table,
  Button,
  Divider,
  TableBody,
  Container,
  TableContainer,
  Box,
  Typography,
  TableRow,
  TableCell,
  Alert,
  LinearProgress,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IRestaurantLocation, IRestaurantLocationFilterStatus } from '../../@types/restaurantLocation';
// services
import {
  useBranches,
  useArchiveBranch,
  useRestoreBranch,
  usePermanentlyDeleteBranch,
  BranchQueryParams,
  BranchListResponse,
} from '../../services';
// hooks
import { useDebounce } from '../../hooks/useDebounce';
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../components/table';
// sections
import {
  RestaurantLocationTableRow,
  RestaurantLocationTableToolbar,
  RestaurantLocationTableSkeleton,
} from '../../sections/@dashboard/restaurantLocation/list';
import { useSnackbar } from '../../components/snackbar';

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

const STATUS_OPTIONS: IRestaurantLocationFilterStatus[] = ['all', 'active', 'archived'];

// Table head configuration
const TABLE_HEAD = [
  { id: 'id', label: 'Location ID', align: 'left' },
  { id: 'branchName', label: 'Location Name', align: 'left' },
  { id: 'branchLocation', label: 'Address', align: 'left' },
  { id: 'phoneNumber', label: 'Phone Number', align: 'left' },
  { id: 'socialLinks', label: 'Social Links', align: 'left' },
  { id: 'archiveStatus', label: 'Archive Status', align: 'left' },
  { id: '', label: 'Action', align: 'right' },
];

// Default column visibility
const DEFAULT_COLUMN_VISIBILITY = {
  id: true,
  branchName: true,
  branchLocation: true,
  phoneNumber: true,
  socialLinks: true,
  archiveStatus: true,
};

// LocalStorage keys specific to restaurant location table
const RESTAURANT_LOCATION_COLUMN_VISIBILITY_KEY = 'restaurantLocationTableColumnVisibility';
const RESTAURANT_LOCATION_DENSE_KEY = 'restaurantLocationTableDense';

// ----------------------------------------------------------------------

export default function RestaurantLocationListPage() {
  // Initialize dense from localStorage
  const getDenseFromStorage = (): boolean => {
    try {
      const saved = localStorage.getItem(RESTAURANT_LOCATION_DENSE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error loading dense mode from localStorage:', error);
      return false;
    }
  };

  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'branchName',
    defaultDense: getDenseFromStorage(),
  });

  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<IRestaurantLocationFilterStatus>('all');
  const [loadingBranchId, setLoadingBranchId] = useState<number | null>(null);

  // Debounce search input (500ms delay)
  const debouncedFilterName = useDebounce(filterName, 500);

  // Reset to page 0 when debounced search value changes
  useEffect(() => {
    setPage(0);
  }, [debouncedFilterName, setPage]);

  // Initialize column visibility from localStorage
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(RESTAURANT_LOCATION_COLUMN_VISIBILITY_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_COLUMN_VISIBILITY;
    } catch (error) {
      console.error('Error loading column visibility from localStorage:', error);
      return DEFAULT_COLUMN_VISIBILITY;
    }
  });

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(RESTAURANT_LOCATION_COLUMN_VISIBILITY_KEY, JSON.stringify(columnVisibility));
    } catch (error) {
      console.error('Error saving column visibility to localStorage:', error);
    }
  }, [columnVisibility]);

  // Save dense mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RESTAURANT_LOCATION_DENSE_KEY, JSON.stringify(dense));
    } catch (error) {
      console.error('Error saving dense mode to localStorage:', error);
    }
  }, [dense]);

  // Build API query params from UI filters
  const queryParams: BranchQueryParams = useMemo(() => {
    const params: BranchQueryParams = {};

    // Common filters for all tabs
    params.page = page + 1; // API uses 1-based pagination
    params.page_size = rowsPerPage;
    params.ordering = orderBy ? `${order === 'desc' ? '-' : ''}${orderBy}` : '-created_at';

    // Search parameter - use debounced value
    if (debouncedFilterName) {
      params.search = debouncedFilterName;
    }

    // Status filter mapping - only for non-"all" tabs
    if (filterStatus === 'archived') {
      params.is_archived = true;
    } else if (filterStatus === 'active') {
      params.is_archived = false;
    }
    // For "all" tab, don't send is_archived (shows both active and archived)

    return params;
  }, [debouncedFilterName, filterStatus, page, rowsPerPage, order, orderBy]);

  // Fetch branches using TanStack Query
  const { data, isLoading, isFetching, isError, error } = useBranches(queryParams) as {
    data: BranchListResponse | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
  };

  // Transform API data to IRestaurantLocation format for table
  const tableData: IRestaurantLocation[] = useMemo(() => {
    if (!data?.results) return [];

    return data.results.map((branch) => ({
      id: branch.id,
      branchName: branch.branchName,
      branchLocation: branch.branchLocation || '',
      phoneNumber: branch.phoneNumber || '',
      email: branch.email || '',
      socialMedia: branch.socialMedia || [],
      restaurantName: branch.restaurantName,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
      isDeleted: branch.isDeleted,
    }));
  }, [data]);

  // Mutation hooks
  const archiveMutation = useArchiveBranch();
  const restoreMutation = useRestoreBranch();
  const permanentDeleteMutation = usePermanentlyDeleteBranch();

  const isFiltered = filterName !== '';

  const isNotFound = !isLoading && !isFetching && tableData.length === 0;

  const denseHeight = dense ? 52 : 72;

  const handleFilterStatus = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: IRestaurantLocationFilterStatus
  ) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleViewRow = (id: number) => {
    navigate(PATH_DASHBOARD.restaurantLocation.view(id.toString()));
  };

  const handleEditRow = (id: number) => {
    navigate(PATH_DASHBOARD.restaurantLocation.edit(id.toString()));
  };

  const handleDeleteRow = async (id: number) => {
    setLoadingBranchId(id);
    try {
      await permanentDeleteMutation.mutateAsync(id);
      enqueueSnackbar('Location deleted permanently', { variant: 'success' });
    } catch (error) {
      console.error('Error permanently deleting location:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete location. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingBranchId(null);
    }
  };

  const handleArchiveRow = async (id: number) => {
    setLoadingBranchId(id);
    try {
      await archiveMutation.mutateAsync(id);
      enqueueSnackbar('Location archived successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error archiving location:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to archive location. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingBranchId(null);
    }
  };

  const handleRestoreRow = async (id: number) => {
    setLoadingBranchId(id);
    try {
      await restoreMutation.mutateAsync(id);
      enqueueSnackbar('Location restored successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error restoring location:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to restore location. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingBranchId(null);
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
    setPage(0);
  };

  const handleToggleColumn = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  return (
    <>
      <Helmet>
        <title> Restaurant Locations: List | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Restaurant Locations"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Restaurant Locations', href: PATH_DASHBOARD.restaurantLocation.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              to={PATH_DASHBOARD.restaurantLocation.new}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Location
            </Button>
          }
        />

        <Card sx={{ mb: { xs: 2, md: 3 }, overflow: 'hidden' }}>
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
            {STATUS_OPTIONS.map((tab) => (
              <Tab key={tab} label={tab} value={tab} sx={{ textTransform: 'capitalize' }} />
            ))}
          </Tabs>

          <Divider />

          <RestaurantLocationTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            onFilterName={handleFilterName}
            onResetFilter={handleResetFilter}
            columnVisibility={columnVisibility}
            onToggleColumn={handleToggleColumn}
            tableHead={TABLE_HEAD}
            formInputSx={FORM_INPUT_SX}
          />

          {(isLoading || isFetching) && <LinearProgress />}

          {isError && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error instanceof Error ? error.message : 'Failed to load locations. Please try again.'}
            </Alert>
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar sx={{ maxWidth: '100%' }}>
              <Table sx={{ minWidth: { xs: 800, md: 960 } }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD.map((head) => ({
                    ...head,
                    // Hide columns that are not visible
                    ...(head.id && !columnVisibility[head.id] ? { width: 0, minWidth: 0 } : {}),
                  })).filter((head) => !head.id || columnVisibility[head.id])}
                  onSort={onSort}
                  sx={{
                    '& .MuiTableCell-root': {
                      px: { xs: 1.5, md: 2 },
                      fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    },
                    '& .MuiTableSortLabel-root': {
                      cursor: 'pointer !important',
                    },
                    '& .MuiBox-root': {
                      cursor: 'pointer !important',
                    },
                  }}
                />

                <TableBody>
                  {isLoading || isFetching ? (
                    <>
                      {[...Array(rowsPerPage)].map((_, index) => (
                        <RestaurantLocationTableSkeleton
                          key={`skeleton-${index}`}
                          columnVisibility={columnVisibility}
                          dense={dense}
                        />
                      ))}
                    </>
                  ) : isError ? null : (
                    <>
                      {tableData.map((row) => (
                        <RestaurantLocationTableRow
                          key={row.id}
                          row={row}
                          onViewRow={() => handleViewRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onArchiveRow={() => handleArchiveRow(row.id)}
                          onRestoreRow={() => handleRestoreRow(row.id)}
                          filterStatus={filterStatus}
                          columnVisibility={columnVisibility}
                          dense={dense}
                          isLoading={loadingBranchId === row.id}
                        />
                      ))}

                      <TableEmptyRows
                        height={denseHeight}
                        emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                      />

                      {isNotFound && (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ py: 10 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography
                                variant="h6"
                                paragraph
                                sx={{
                                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                                  fontWeight: 700,
                                }}
                              >
                                No results found
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                                }}
                              >
                                Try adjusting your search or filter to find what you are looking for.
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={data?.count || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            dense={dense}
            onChangeDense={onChangeDense}
            sx={{
              '& .MuiTablePagination-root': {
                borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
              },
            }}
          />
        </Card>
      </Container>
    </>
  );
}
