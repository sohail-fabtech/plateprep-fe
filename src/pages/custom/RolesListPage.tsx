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
import { IRole, IRoleFilterStatus } from '../../@types/role';
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
import { RoleTableRow, RoleTableToolbar, RoleTableSkeleton } from '../../sections/@dashboard/role/list';
import { useSnackbar } from '../../components/snackbar';
// hooks
import { useSubscription } from '../../hooks/useSubscription';
import { usePermissions } from '../../hooks/usePermissions';
// auth
import PermissionGuard from '../../auth/PermissionGuard';
// services
import {
  useRoles,
  useDeleteRole,
  useRestoreRole,
  usePermanentlyDeleteRole,
  RoleQueryParams,
  RoleListResponse,
} from '../../services';
// utils
import { transformApiResponseToRole } from '../../utils/roleAdapter';

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

// Table head configuration
const TABLE_HEAD = [
  { id: 'id', label: 'Role ID', align: 'left' },
  { id: 'role_name', label: 'Role Name', align: 'left' },
  { id: 'description', label: 'Description', align: 'left' },
  { id: 'permissions_count', label: 'Permissions', align: 'left' },
  { id: 'users_count', label: 'Users', align: 'left' },
  { id: 'archiveStatus', label: 'Archive Status', align: 'left' },
  { id: '', label: 'Action', align: 'right' },
];

// Default column visibility
const DEFAULT_COLUMN_VISIBILITY = {
  id: true,
  role_name: true,
  description: true,
  permissions_count: true,
  users_count: true,
  archiveStatus: true,
};

// LocalStorage keys specific to roles table
const ROLES_COLUMN_VISIBILITY_KEY = 'rolesTableColumnVisibility';
const ROLES_DENSE_KEY = 'rolesTableDense';

// ----------------------------------------------------------------------

export default function RolesListPage() {
  // Initialize dense from localStorage
  const getDenseFromStorage = (): boolean => {
    try {
      const saved = localStorage.getItem(ROLES_DENSE_KEY);
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

  // Subscription dialog state
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  // Track loading state per role ID
  const [loadingRoleId, setLoadingRoleId] = useState<string | null>(null);

  // Permission-based tab visibility
  const visibleTabs = useMemo(() => {
    const canView = hasPermission('view_roles');
    const canEdit = hasPermission('edit_roles');
    const canDelete = hasPermission('delete_roles');

    if (!canView) return [];

    const tabs: IRoleFilterStatus[] = [];

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
  const [filterStatus, setFilterStatus] = useState<IRoleFilterStatus>('all');

  // Debounce search input (500ms delay)
  const debouncedFilterName = useDebounce(filterName, 500);

  // Reset to page 0 when debounced search value changes
  useEffect(() => {
    setPage(0);
  }, [debouncedFilterName, setPage]);

  // Mutation hooks
  const archiveMutation = useDeleteRole();
  const restoreMutation = useRestoreRole();
  const permanentDeleteMutation = usePermanentlyDeleteRole();

  // Initialize column visibility from localStorage
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(ROLES_COLUMN_VISIBILITY_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_COLUMN_VISIBILITY;
    } catch (error) {
      console.error('Error loading column visibility from localStorage:', error);
      return DEFAULT_COLUMN_VISIBILITY;
    }
  });

  // Build API query params from UI filters
  const queryParams: RoleQueryParams = useMemo(() => {
    const params: RoleQueryParams = {};

    // Common filters for all tabs
    params.page = page + 1; // API uses 1-based pagination
    params.page_size = rowsPerPage;
    params.ordering = orderBy ? `${order === 'desc' ? '-' : ''}${orderBy}` : '-id';

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

  // Fetch roles using TanStack Query
  const { data, isLoading, isFetching, isError, error } = useRoles(queryParams) as {
    data: RoleListResponse | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
  };

  // Transform API data to IRole format for table
  const tableData: IRole[] = useMemo(() => {
    if (!data?.results) return [];

    return data.results.map((role: any) => transformApiResponseToRole(role));
  }, [data]);

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(ROLES_COLUMN_VISIBILITY_KEY, JSON.stringify(columnVisibility));
    } catch (error) {
      console.error('Error saving column visibility to localStorage:', error);
    }
  }, [columnVisibility]);

  // Save dense mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(ROLES_DENSE_KEY, JSON.stringify(dense));
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

  const isFiltered = filterName !== '';

  const isNotFound = !isLoading && !isError && dataFiltered.length === 0 && isFiltered;

  const totalPages = data?.count ? Math.ceil(data.count / rowsPerPage) : 0;

  const denseHeight = dense ? 52 : 72;

  const handleFilterStatus = (event: React.SyntheticEvent<Element, Event>, newValue: IRoleFilterStatus) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleViewRow = (id: string) => {
    navigate(PATH_DASHBOARD.roles.view(id));
  };

  const handleEditRow = (id: string) => {
    navigate(PATH_DASHBOARD.roles.edit(id));
  };

  const handleArchiveRow = async (id: string) => {
    setLoadingRoleId(id);
    try {
      await archiveMutation.mutateAsync(id);
      enqueueSnackbar('Role archived successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error archiving role:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to archive role. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingRoleId(null);
    }
  };

  const handleRestoreRow = async (id: string) => {
    setLoadingRoleId(id);
    try {
      await restoreMutation.mutateAsync(id);
      enqueueSnackbar('Role restored successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error restoring role:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to restore role. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingRoleId(null);
    }
  };

  const handlePermanentDeleteRow = async (id: string) => {
    setLoadingRoleId(id);
    try {
      await permanentDeleteMutation.mutateAsync(id);
      enqueueSnackbar('Role deleted permanently', { variant: 'success' });
    } catch (error) {
      console.error('Error permanently deleting role:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete role. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingRoleId(null);
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
    // Reset to 'all' tab
    setFilterStatus('all');
    setPage(0);
  };

  // Ensure current filterStatus is valid based on permissions
  useEffect(() => {
    if (visibleTabs.length > 0) {
      if (!visibleTabs.includes(filterStatus)) {
        const firstTab = visibleTabs[0] as IRoleFilterStatus;
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
        <title> Roles: List | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Role List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Roles', href: PATH_DASHBOARD.roles.root },
            { name: 'List' },
          ]}
          action={
            <PermissionGuard permission="create_roles">
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => {
                  if (!hasSubscription()) {
                    setSubscriptionDialogOpen(true);
                  } else {
                    navigate(PATH_DASHBOARD.roles.create);
                  }
                }}
              >
                New Role
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

          <RoleTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            onFilterName={handleFilterName}
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
                      <RoleTableSkeleton
                        key={`skeleton-${index}`}
                        columnVisibility={columnVisibility}
                        dense={dense}
                      />
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 10 }}>
                        <Alert severity="error">
                          {error instanceof Error ? error.message : 'Failed to load roles. Please try again.'}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {dataFiltered.map((row) => (
                        <RoleTableRow
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
                          isLoading={loadingRoleId === row.id}
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
                              : 'Get started by creating your first role.'}
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
        message="You need an active subscription to create a new role."
        buttonText="Subscribe Now"
        onButtonClick={() => {
          setSubscriptionDialogOpen(false);
          navigate(PATH_DASHBOARD.subscription);
        }}
      />
    </>
  );
}

