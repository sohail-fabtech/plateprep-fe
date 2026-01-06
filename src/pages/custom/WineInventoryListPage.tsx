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
  LinearProgress,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IWineInventory, IWineInventoryFilterStatus } from '../../@types/wineInventory';
// constants
import { WINE_TYPE_OPTIONS, REGION_OPTIONS } from '../../constants/wineInventoryOptions';
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../components/table';
// sections
import {
  WineInventoryTableRow,
  WineInventoryTableToolbar,
  WineInventoryTableSkeleton,
} from '../../sections/@dashboard/wineInventory/list';
import { useSnackbar } from '../../components/snackbar';
// hooks
import { useDebounce } from '../../hooks/useDebounce';
import { useBranchFilter } from '../../hooks/useBranchFilter';
// services
import {
  useWineInventoryList,
  useDeleteWineInventory,
  useRestoreWineInventory,
  usePermanentlyDeleteWineInventory,
  WineInventoryQueryParams,
} from '../../services/wineInventory/wineInventoryHooks';

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

const STATUS_OPTIONS: IWineInventoryFilterStatus[] = ['all', 'active', 'archived'];

const STOCK_STATUS_OPTIONS = ['IN_STOCK', 'LOW', 'OUT'];

// Table head configuration
const TABLE_HEAD = [
  { id: 'wineName', label: 'Wine Name', align: 'left' },
  { id: 'wineType', label: 'Wine Type', align: 'left' },
  { id: 'region', label: 'Region', align: 'left' },
  { id: 'vintage', label: 'Vintage', align: 'left' },
  { id: 'totalStock', label: 'Total Stock', align: 'left' },
  { id: 'stockStatus', label: 'Stock Status', align: 'left' },
  { id: 'tags', label: 'Tags', align: 'left' },
  { id: 'location', label: 'Location', align: 'left' },
  { id: '', label: 'Action', align: 'right' },
];

// Default column visibility
const DEFAULT_COLUMN_VISIBILITY = {
  wineName: true,
  wineType: true,
  region: true,
  vintage: true,
  totalStock: true,
  stockStatus: true,
  tags: true,
  location: true,
};

// LocalStorage keys specific to wine inventory table
const WINE_INVENTORY_COLUMN_VISIBILITY_KEY = 'wineInventoryTableColumnVisibility';
const WINE_INVENTORY_DENSE_KEY = 'wineInventoryTableDense';

// ----------------------------------------------------------------------

export default function WineInventoryListPage() {
  // Initialize dense from localStorage
  const getDenseFromStorage = (): boolean => {
    try {
      const saved = localStorage.getItem(WINE_INVENTORY_DENSE_KEY);
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
    defaultOrderBy: 'wineName',
    defaultDense: getDenseFromStorage(),
  });

  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Branch filter hook
  const { filterBranch, setFilterBranch, branchIdForApi, showBranchFilter } = useBranchFilter();

  const [filterName, setFilterName] = useState('');
  const [filterWineType, setFilterWineType] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState<IWineInventoryFilterStatus>('all');
  const [loadingWineId, setLoadingWineId] = useState<string | null>(null);

  // Debounce search input
  const debouncedFilterName = useDebounce(filterName, 500);

  // Mutation hooks
  const archiveMutation = useDeleteWineInventory();
  const restoreMutation = useRestoreWineInventory();
  const permanentDeleteMutation = usePermanentlyDeleteWineInventory();

  // Initialize column visibility from localStorage
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(WINE_INVENTORY_COLUMN_VISIBILITY_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_COLUMN_VISIBILITY;
    } catch (error) {
      console.error('Error loading column visibility from localStorage:', error);
      return DEFAULT_COLUMN_VISIBILITY;
    }
  });

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(WINE_INVENTORY_COLUMN_VISIBILITY_KEY, JSON.stringify(columnVisibility));
    } catch (error) {
      console.error('Error saving column visibility to localStorage:', error);
    }
  }, [columnVisibility]);

  // Save dense mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(WINE_INVENTORY_DENSE_KEY, JSON.stringify(dense));
    } catch (error) {
      console.error('Error saving dense mode to localStorage:', error);
    }
  }, [dense]);

  // Build API query params from UI filters
  const queryParams: WineInventoryQueryParams = useMemo(() => {
    const params: WineInventoryQueryParams = {};

    // Common filters for all tabs
    params.page = page + 1; // API uses 1-based pagination
    params.page_size = rowsPerPage;
    params.ordering = orderBy ? `${order === 'desc' ? '-' : ''}${orderBy}` : '-created_at';

    // Search parameter - use debounced value
    if (debouncedFilterName) {
      params.search = debouncedFilterName;
    }

    // Wine type filter
    if (filterWineType) {
      params.wine_type = filterWineType;
    }

    // Region filter
    if (filterRegion) {
      params.region = filterRegion;
    }

    // Stock status filter - map UI values to API format
    if (filterStockStatus) {
      const stockStatusMap: Record<string, string> = {
        IN_STOCK: 'in_stock',
        LOW: 'low_stock',
        OUT: 'out_of_stock',
      };
      params.stock_status = stockStatusMap[filterStockStatus] || filterStockStatus;
    }

    // Branch filter: use selected branch if owner, otherwise use user's branch
    if (branchIdForApi) {
      params.branch =
        typeof branchIdForApi === 'string' ? parseInt(branchIdForApi, 10) : branchIdForApi;
    }

    // Status filter mapping - only for non-"all" tabs
    if (filterStatus === 'archived') {
      params.is_deleted = true;
    } else if (filterStatus === 'active') {
      params.is_deleted = false;
    }
    // For "all" tab, don't send is_deleted (shows both active and archived)

    return params;
  }, [
    debouncedFilterName,
    filterWineType,
    filterRegion,
    filterStockStatus,
    filterStatus,
    page,
    rowsPerPage,
    order,
    orderBy,
    branchIdForApi,
  ]);

  // Fetch wine inventory using TanStack Query
  const { data, isLoading, isFetching, isError, error } = useWineInventoryList(queryParams) as {
    data:
      | { count: number; next: string | null; previous: string | null; results: IWineInventory[] }
      | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
  };

  // Transform API data to IWineInventory format for table
  const tableData: IWineInventory[] = useMemo(() => {
    if (!data?.results) return [];
    return data.results;
  }, [data]);

  const isFiltered =
    filterName !== '' ||
    filterWineType !== '' ||
    filterRegion !== '' ||
    filterStockStatus !== '' ||
    (showBranchFilter && filterBranch !== '');

  const isNotFound =
    !isLoading && !isError && data?.results && data.results.length === 0 && isFiltered;
  const totalCount = data?.count || 0;

  const denseHeight = dense ? 52 : 72;

  const handleFilterStatus = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: IWineInventoryFilterStatus
  ) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterWineType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterWineType(event.target.value);
  };

  const handleFilterRegion = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterRegion(event.target.value);
  };

  const handleFilterStockStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterStockStatus(event.target.value);
  };

  const handleFilterBranch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterBranch(event.target.value);
  };

  const handleViewRow = (id: string) => {
    navigate(PATH_DASHBOARD.wineInventory.view(id));
  };

  const handleEditRow = (id: string) => {
    navigate(PATH_DASHBOARD.wineInventory.edit(id));
  };

  const handleArchiveRow = async (id: string) => {
    setLoadingWineId(id);
    try {
      await archiveMutation.mutateAsync(id);
      enqueueSnackbar('Wine archived successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error archiving wine:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to archive wine. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingWineId(null);
    }
  };

  const handleRestoreRow = async (id: string) => {
    setLoadingWineId(id);
    try {
      await restoreMutation.mutateAsync(id);
      enqueueSnackbar('Wine restored successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error restoring wine:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to restore wine. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingWineId(null);
    }
  };

  const handlePermanentDeleteRow = async (id: string) => {
    setLoadingWineId(id);
    try {
      await permanentDeleteMutation.mutateAsync(id);
      enqueueSnackbar('Wine deleted permanently', { variant: 'success' });
    } catch (error) {
      console.error('Error permanently deleting wine:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete wine. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingWineId(null);
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterWineType('');
    setFilterRegion('');
    setFilterStockStatus('');
    if (showBranchFilter) {
      setFilterBranch('');
    }
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
        <title> Wine Inventory: List | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Wine Inventory"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Wine Inventory', href: PATH_DASHBOARD.wineInventory.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              to={PATH_DASHBOARD.wineInventory.create}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Wine
            </Button>
          }
        />

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
            {STATUS_OPTIONS.map((tab) => (
              <Tab key={tab} label={tab} value={tab} sx={{ textTransform: 'capitalize' }} />
            ))}
          </Tabs>

          <Divider />

          <WineInventoryTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            filterWineType={filterWineType}
            filterRegion={filterRegion}
            filterStockStatus={filterStockStatus}
            filterLocation={showBranchFilter ? filterBranch || '' : ''}
            optionsWineType={WINE_TYPE_OPTIONS}
            optionsRegion={REGION_OPTIONS}
            optionsStockStatus={STOCK_STATUS_OPTIONS}
            onFilterName={handleFilterName}
            onFilterWineType={handleFilterWineType}
            onFilterRegion={handleFilterRegion}
            onFilterStockStatus={handleFilterStockStatus}
            onFilterLocation={showBranchFilter ? handleFilterBranch : undefined}
            onResetFilter={handleResetFilter}
            columnVisibility={columnVisibility}
            onToggleColumn={handleToggleColumn}
            tableHead={TABLE_HEAD}
            formInputSx={FORM_INPUT_SX}
            showBranchFilter={showBranchFilter}
          />
          {isLoading && <LinearProgress />}
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar sx={{ maxWidth: '100%' }}>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: { xs: 800, md: 1200 } }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD.map((head) => ({
                    ...head,
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
                  {isLoading ? (
                    Array.from({ length: rowsPerPage }).map((_, index) => (
                      <WineInventoryTableSkeleton
                        key={`skeleton-${index}`}
                        columnVisibility={columnVisibility}
                        dense={dense}
                      />
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ py: 10 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            paragraph
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                              fontWeight: 700,
                            }}
                          >
                            Error loading wine inventory
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            }}
                          >
                            {error instanceof Error
                              ? error.message
                              : 'Failed to load wine inventory. Please try again.'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {tableData.map((row) => (
                        <WineInventoryTableRow
                          key={row.id}
                          row={row}
                          onViewRow={() => handleViewRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onDeleteRow={() => handlePermanentDeleteRow(row.id)}
                          onArchiveRow={() => handleArchiveRow(row.id)}
                          onRestoreRow={() => handleRestoreRow(row.id)}
                          filterStatus={filterStatus}
                          columnVisibility={columnVisibility}
                          dense={dense}
                          isLoading={loadingWineId === row.id}
                        />
                      ))}

                      <TableEmptyRows
                        height={denseHeight}
                        emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                      />
                    </>
                  )}

                  {isNotFound && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ py: 10 }}>
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
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={totalCount}
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
