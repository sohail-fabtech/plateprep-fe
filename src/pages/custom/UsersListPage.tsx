import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// hooks
import { useDebounce } from '../../hooks/useDebounce';
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
import { IUser, IUserFilterStatus } from '../../@types/user';
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
import { SubscriptionDialog } from '../../components/subscription-dialog';
// sections
import { UserTableRow, UserTableToolbar, UserTableSkeleton } from '../../sections/@dashboard/user/list';
import { useSnackbar } from '../../components/snackbar';
// hooks
import { useBranchFilter } from '../../hooks/useBranchFilter';
import { useSubscription } from '../../hooks/useSubscription';
import { usePermissions } from '../../hooks/usePermissions';
// auth
import PermissionGuard from '../../auth/PermissionGuard';
// services
import {
  useUsers,
  useDeleteUser,
  useRestoreUser,
  usePermanentlyDeleteUser,
  UserQueryParams,
  UserListResponse,
} from '../../services';
// utils
import { transformApiResponseToUser } from '../../utils/userAdapter';

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

const STATUS_OPTIONS: IUserFilterStatus[] = ['all', 'active', 'archived'];

const ROLE_OPTIONS = [
  'all',
  'admin',
  'manager',
  'staff',
  'ux designer',
  'full stack designer',
  'backend developer',
  'project manager',
  'leader',
  'ui designer',
  'ui/ux designer',
  'front end developer',
  'full stack developer',
];

// Table head configuration
const TABLE_HEAD = [
  { id: 'id', label: 'User ID', align: 'left' },
  { id: 'name', label: 'User Name', align: 'left' },
  { id: 'email', label: 'Email', align: 'left' },
  { id: 'phoneNumber', label: 'Phone Number', align: 'left', width: 150, minWidth: 150 },
  { id: 'address', label: 'Address', align: 'left', width: 300, minWidth: 300 },
  { id: 'location', label: 'Location', align: 'left' },
  { id: 'role', label: 'User Role', align: 'left' },
  { id: 'archiveStatus', label: 'Archive Status', align: 'left' },
  { id: '', label: 'Action', align: 'right' },
];

// Default column visibility
const DEFAULT_COLUMN_VISIBILITY = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  address: true,
  location: true,
  role: true,
  archiveStatus: true,
};

// LocalStorage keys specific to users table
const USERS_COLUMN_VISIBILITY_KEY = 'usersTableColumnVisibility';
const USERS_DENSE_KEY = 'usersTableDense';

// ----------------------------------------------------------------------

export default function UsersListPage() {
  // Initialize dense from localStorage
  const getDenseFromStorage = (): boolean => {
    try {
      const saved = localStorage.getItem(USERS_DENSE_KEY);
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
    defaultOrderBy: 'id',
    defaultDense: getDenseFromStorage(),
  });

  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { hasSubscription } = useSubscription();

  // Branch filter hook
  const { filterBranch, setFilterBranch, branchIdForApi, showBranchFilter } = useBranchFilter();

  // Subscription dialog state
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  // Track loading state per user ID
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Permission-based tab visibility
  const visibleTabs = useMemo(() => {
    const canView = hasPermission('view_users');
    const canEdit = hasPermission('edit_users');
    const canDelete = hasPermission('delete_users');

    if (!canView) return [];

    const tabs: IUserFilterStatus[] = [];

    // Always show 'all' tab first
    tabs.push('all');

    // If only view permission (no edit, no delete), show only all tab
    if (canView && !canEdit && !canDelete) {
      return ['all'];
    }

    // If edit permission, add active tab
    if (canEdit) {
      tabs.push('active');
    }

    // If delete permission, add archived tab
    if (canDelete) {
      tabs.push('archived');
    }

    return tabs;
  }, [hasPermission]);

  const [filterName, setFilterName] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState<IUserFilterStatus>('all');

  // Debounce search input (500ms delay)
  const debouncedFilterName = useDebounce(filterName, 500);

  // Reset to page 0 when debounced search value changes
  useEffect(() => {
    setPage(0);
  }, [debouncedFilterName]);

  // Mutation hooks
  const archiveMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();
  const permanentDeleteMutation = usePermanentlyDeleteUser();

  // Initialize column visibility from localStorage
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(USERS_COLUMN_VISIBILITY_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_COLUMN_VISIBILITY;
    } catch (error) {
      console.error('Error loading column visibility from localStorage:', error);
      return DEFAULT_COLUMN_VISIBILITY;
    }
  });

  // Build API query params from UI filters
  const queryParams: UserQueryParams = useMemo(() => {
    const params: UserQueryParams = {};

    // Common filters for all tabs
    params.page = page + 1; // API uses 1-based pagination
    params.page_size = rowsPerPage;
    params.ordering = orderBy ? `${order === 'desc' ? '-' : ''}${orderBy}` : '-id';

    // Search parameter - use debounced value
    if (debouncedFilterName) {
      params.search = debouncedFilterName;
    }

    // Branch filter: use selected branch if owner, otherwise use user's branch
    if (branchIdForApi) {
      params.branch = typeof branchIdForApi === 'string' ? parseInt(branchIdForApi, 10) : branchIdForApi;
    }

    // Status filter mapping - only for non-"all" tabs
    if (filterStatus === 'archived') {
      params.is_archived = true;
    } else if (filterStatus === 'active') {
      params.is_archived = false;
    }
    // For "all" tab, don't send is_archived (shows both active and archived)

    return params;
  }, [debouncedFilterName, filterStatus, page, rowsPerPage, order, orderBy, branchIdForApi]);

  // Fetch users using TanStack Query
  const { data, isLoading, isFetching, isError, error } = useUsers(queryParams) as {
    data: UserListResponse | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
  };

  // Transform API data to IUser format for table
  const tableData: IUser[] = useMemo(() => {
    if (!data?.results) return [];
    
    return data.results.map((user: any) => transformApiResponseToUser(user));
  }, [data]);

  // Get unique locations from tableData
  const locationOptions = useMemo(() => {
    const locations = Array.from(
      new Set(tableData.map((user: IUser) => user.location).filter((loc): loc is string => Boolean(loc)))
    );
    return locations.sort();
  }, [tableData]);

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(USERS_COLUMN_VISIBILITY_KEY, JSON.stringify(columnVisibility));
    } catch (error) {
      console.error('Error saving column visibility to localStorage:', error);
    }
  }, [columnVisibility]);

  // Save dense mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(USERS_DENSE_KEY, JSON.stringify(dense));
    } catch (error) {
      console.error('Error saving dense mode to localStorage:', error);
    }
  }, [dense]);

  // Client-side sorting (API handles filtering)
  const dataFiltered = useMemo(() => {
    if (!tableData.length) return [];
    
    const sorted = [...tableData].sort((a, b) => {
      const comparator = getComparator(order, orderBy);
      return comparator(a as any, b as any);
    });
    return sorted;
  }, [tableData, order, orderBy]);

  const isFiltered = filterName !== '' || filterLocation !== 'all' || filterBranch !== '';

  const isNotFound = !isLoading && !isError && dataFiltered.length === 0 && isFiltered;
  
  const totalPages = data?.count ? Math.ceil(data.count / rowsPerPage) : 0;

  const denseHeight = dense ? 52 : 72;

  const handleFilterStatus = (event: React.SyntheticEvent<Element, Event>, newValue: IUserFilterStatus) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterLocation = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterLocation(event.target.value);
  };

  const handleViewRow = (id: string) => {
    navigate(PATH_DASHBOARD.users.view(id));
  };

  const handleEditRow = (id: string) => {
    navigate(PATH_DASHBOARD.users.edit(id));
  };

  const handleArchiveRow = async (id: string) => {
    setLoadingUserId(id);
    try {
      await archiveMutation.mutateAsync(id);
      enqueueSnackbar('User archived successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error archiving user:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to archive user. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleRestoreRow = async (id: string) => {
    setLoadingUserId(id);
    try {
      await restoreMutation.mutateAsync(id);
      enqueueSnackbar('User restored successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error restoring user:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to restore user. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingUserId(null);
    }
  };

  const handlePermanentDeleteRow = async (id: string) => {
    setLoadingUserId(id);
    try {
      await permanentDeleteMutation.mutateAsync(id);
      enqueueSnackbar('User deleted permanently', { variant: 'success' });
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete user. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleFilterBranch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterBranch(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterLocation('all');
    setFilterBranch('');
    // Reset to 'all' tab
    setFilterStatus('all');
    setPage(0);
  };

  // Ensure current filterStatus is valid based on permissions
  useEffect(() => {
    if (visibleTabs.length > 0) {
      if (!visibleTabs.includes(filterStatus)) {
        const firstTab = visibleTabs[0] as IUserFilterStatus;
        setFilterStatus(firstTab);
      }
    }
  }, [visibleTabs, filterStatus]);

  const handleToggleColumn = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  return (
    <>
      <Helmet>
        <title> Users: List | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="User List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Users', href: PATH_DASHBOARD.users.root },
            { name: 'List' },
          ]}
          action={
            <PermissionGuard permission="create_users">
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => {
                  if (!hasSubscription()) {
                    setSubscriptionDialogOpen(true);
                  } else {
                    navigate(PATH_DASHBOARD.users.create);
                  }
                }}
              >
                New User
              </Button>
            </PermissionGuard>
          }
        />

        <Card sx={{ mb: { xs: 2, md: 3 }, overflow: 'hidden' }}>
          {visibleTabs.length > 0 && (
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
          )}


          <Divider />

          <UserTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            filterRole="all"
            filterLocation={filterLocation}
            filterBranch={filterBranch}
            showBranchFilter={showBranchFilter}
            optionsRole={[]}
            optionsLocation={locationOptions}
            onFilterName={handleFilterName}
            onFilterRole={() => {}}
            onFilterLocation={handleFilterLocation}
            onFilterBranch={handleFilterBranch}
            onResetFilter={handleResetFilter}
            columnVisibility={columnVisibility}
            onToggleColumn={handleToggleColumn}
            tableHead={TABLE_HEAD}
            formInputSx={FORM_INPUT_SX}
          />
 {isFetching && <LinearProgress />}
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar sx={{ maxWidth: '100%' }}>
              <Table sx={{ minWidth: { xs: 800, md: 960 } }}>
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
                      <UserTableSkeleton
                        key={`skeleton-${index}`}
                        columnVisibility={columnVisibility}
                        dense={dense}
                      />
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 10 }}>
                        <Alert severity="error">
                          {error instanceof Error ? error.message : 'Failed to load users. Please try again.'}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {dataFiltered.map((row) => (
                        <UserTableRow
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
                          isLoading={loadingUserId === row.id}
                        />
                      ))}

                      <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)} />
                    </>
                  )}

                  {isNotFound && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 10 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 1,
                              fontSize: { xs: '1rem', md: '1.125rem' },
                              fontWeight: 600,
                            }}
                          >
                            {isFiltered
                              ? 'Try adjusting your search or filter to find what you are looking for.'
                              : 'Get started by creating your first user.'}
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
            count={data?.count || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            dense={dense}
            onChangeDense={onChangeDense}
          />
        </Card>
      </Container>

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        message="You need an active subscription to create a new user."
        buttonText="Subscribe Now"
        onButtonClick={() => {
          setSubscriptionDialogOpen(false);
          navigate(PATH_DASHBOARD.subscription);
        }}
      />
    </>
  );
}


