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
import { ITask, ITaskFilterStatus } from '../../@types/task';
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
import { TaskTableRow, TaskTableToolbar, TaskTableSkeleton } from '../../sections/@dashboard/task/list';
import { useSnackbar } from '../../components/snackbar';
// hooks
import { useDebounce } from '../../hooks/useDebounce';
import { useBranchFilter } from '../../hooks/useBranchFilter';
import { useSubscription } from '../../hooks/useSubscription';
import { usePermissions } from '../../hooks/usePermissions';
// auth
import PermissionGuard from '../../auth/PermissionGuard';
import { useAuthContext } from '../../auth/useAuthContext';
// services
import {
  useTasks,
  useDeleteTask,
  useRestoreTask,
  usePermanentlyDeleteTask,
  useUpdateTaskStatus,
  TaskQueryParams,
  TaskListResponse,
} from '../../services';

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

const STATUS_OPTIONS: ITaskFilterStatus[] = ['all', 'active', 'archived'];

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const ITEMS_PER_PAGE = 10;

// Map API status to UI status
const mapApiStatusToUI = (statusValue: string): ITask['status'] => {
  const statusMap: Record<string, ITask['status']> = {
    'AS': 'pending',
    'IP': 'in-progress',
    'CP': 'completed',
    'CL': 'cancelled',
    'OD': 'pending',
  };
  return statusMap[statusValue] || 'pending';
};

// Map API priority to UI priority
const mapApiPriorityToUI = (priorityValue: string): ITask['priority'] => {
  const priorityMap: Record<string, ITask['priority']> = {
    'H': 'high',
    'M': 'medium',
    'L': 'low',
  };
  return priorityMap[priorityValue] || 'medium';
};

// Table head configuration
const TABLE_HEAD = [
  { id: 'staffName', label: 'Staff Name', align: 'left' },
  { id: 'taskName', label: 'Task Name', align: 'left' },
  { id: 'taskDescription', label: 'Task Description', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'priority', label: 'Priority Level', align: 'left' },
  { id: 'archiveStatus', label: 'Archive Status', align: 'left' },
  { id: 'assignedToMe', label: 'Assigned to Me', align: 'left' },
  { id: '', label: 'Action', align: 'right' },
];

// Default column visibility
const DEFAULT_COLUMN_VISIBILITY = {
  staffName: true,
  taskName: true,
  taskDescription: true,
  status: true,
  priority: true,
  archiveStatus: true,
  assignedToMe: true,
};

// LocalStorage keys specific to tasks table
const TASKS_COLUMN_VISIBILITY_KEY = 'tasksTableColumnVisibility';
const TASKS_DENSE_KEY = 'tasksTableDense';

// ----------------------------------------------------------------------

export default function TasksListPage() {
  // Initialize dense from localStorage
  const getDenseFromStorage = (): boolean => {
    try {
      const saved = localStorage.getItem(TASKS_DENSE_KEY);
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
    defaultOrderBy: 'taskName',
    defaultDense: getDenseFromStorage(),
  });

  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { hasSubscription } = useSubscription();
  const { user } = useAuthContext();

  // Branch filter hook
  const { filterBranch, setFilterBranch, branchIdForApi, showBranchFilter } = useBranchFilter();

  // Subscription dialog state
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  // Track loading state per task ID
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  // Permission-based tab visibility
  const visibleTabs = useMemo(() => {
    const canView = hasPermission('view_tasks');
    const canEdit = hasPermission('edit_tasks');
    const canDelete = hasPermission('delete_tasks');

    if (!canView) return [];

    const tabs: ITaskFilterStatus[] = [];

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

  const [filterPriority, setFilterPriority] = useState('');

  const [filterStatus, setFilterStatus] = useState<ITaskFilterStatus>('all');

  // Debounce search input (500ms delay)
  const debouncedFilterName = useDebounce(filterName, 500);

  // Reset to page 0 when debounced search value changes
  useEffect(() => {
    setPage(0);
  }, [debouncedFilterName]);

  // Mutation hooks
  const archiveMutation = useDeleteTask();
  const restoreMutation = useRestoreTask();
  const permanentDeleteMutation = usePermanentlyDeleteTask();
  const statusUpdateMutation = useUpdateTaskStatus();

  // Initialize column visibility from localStorage
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(TASKS_COLUMN_VISIBILITY_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_COLUMN_VISIBILITY;
    } catch (error) {
      console.error('Error loading column visibility from localStorage:', error);
      return DEFAULT_COLUMN_VISIBILITY;
    }
  });

  // Build API query params from UI filters
  const queryParams: TaskQueryParams = useMemo(() => {
    const params: TaskQueryParams = {};

    // Common filters for all tabs
    params.page = page + 1; // API uses 1-based pagination
    params.page_size = rowsPerPage;
    params.ordering = orderBy ? `${order === 'desc' ? '-' : ''}${orderBy}` : '-created_at';

    // Search parameter - use debounced value
    if (debouncedFilterName) {
      params.search = debouncedFilterName;
    }

    // Priority filter - map UI priority to API format
    if (filterPriority) {
      const priorityMap: Record<string, string> = {
        'low': 'L',
        'medium': 'M',
        'high': 'H',
        'urgent': 'H',
      };
      params.priority = priorityMap[filterPriority] || filterPriority;
    }

    // Branch filter: use selected branch if owner, otherwise use user's branch
    if (branchIdForApi) {
      params.branch = typeof branchIdForApi === 'string' ? parseInt(branchIdForApi, 10) : branchIdForApi;
    }

    // Status filter mapping - only for non-"all" tabs
    if (filterStatus === 'archived') {
      params.is_deleted = true;
    } else if (filterStatus === 'active') {
      params.is_deleted = false;
      // Optionally filter by status (AS, IP)
      // params.status = 'AS,IP';
    }
    // For "all" tab, don't send is_deleted (shows both active and archived)

    return params;
  }, [debouncedFilterName, filterPriority, filterStatus, page, rowsPerPage, order, orderBy, branchIdForApi]);

  // Fetch tasks using TanStack Query
  const { data, isLoading, isFetching, isError, error } = useTasks(queryParams) as {
    data: TaskListResponse | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
  };

  // Transform API data to ITask format for table
  const tableData: ITask[] = useMemo(() => {
    if (!data?.results) return [];
    
    return data.results.map((task) => ({
      id: String(task.id),
      staffName: task.staffFullName || 'Unassigned',
      staffId: task.staffId,
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      status: mapApiStatusToUI(task.status.value),
      priority: mapApiPriorityToUI(task.priority.value),
      createdAt: task.dueDate || new Date().toISOString(),
      updatedAt: task.dueDate || new Date().toISOString(),
      dueDate: task.dueDate || null,
      isArchived: task.isDeleted || false,
    }));
  }, [data]);

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_COLUMN_VISIBILITY_KEY, JSON.stringify(columnVisibility));
    } catch (error) {
      console.error('Error saving column visibility to localStorage:', error);
    }
  }, [columnVisibility]);

  // Save dense mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_DENSE_KEY, JSON.stringify(dense));
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

  const isFiltered = filterName !== '' || filterPriority !== '' || filterBranch !== '';

  const isNotFound = !isLoading && !isError && dataFiltered.length === 0 && isFiltered;
  
  const totalPages = data?.count ? Math.ceil(data.count / rowsPerPage) : 0;

  const denseHeight = dense ? 52 : 72;

  const handleFilterStatus = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: string
  ) => {
    setPage(0);
    setFilterStatus(newValue as ITaskFilterStatus);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterPriority = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterPriority(event.target.value);
  };

  const handleViewRow = (id: string) => {
    navigate(PATH_DASHBOARD.tasks.view(id));
  };

  const handleEditRow = (id: string) => {
    navigate(PATH_DASHBOARD.tasks.edit(id));
  };

  const handleArchiveRow = async (id: string) => {
    setLoadingTaskId(id);
    try {
      await archiveMutation.mutateAsync(id);
      enqueueSnackbar('Task archived successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error archiving task:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to archive task. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleRestoreRow = async (id: string) => {
    setLoadingTaskId(id);
    try {
      await restoreMutation.mutateAsync(id);
      enqueueSnackbar('Task restored successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error restoring task:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to restore task. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handlePermanentDeleteRow = async (id: string) => {
    setLoadingTaskId(id);
    try {
      await permanentDeleteMutation.mutateAsync(id);
      enqueueSnackbar('Task deleted permanently', { variant: 'success' });
    } catch (error) {
      console.error('Error permanently deleting task:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete task. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleStatusUpdate = async (id: string, statusValue: string) => {
    setLoadingTaskId(id);
    try {
      await statusUpdateMutation.mutateAsync({ id, status: statusValue });
      enqueueSnackbar('Task status updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error updating task status:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update task status. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleFilterBranch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterBranch(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterPriority('');
    setFilterBranch('');
    // Reset to 'all' tab
    setFilterStatus('all');
    setPage(0);
  };

  // Ensure current filterStatus is valid based on permissions
  useEffect(() => {
    if (visibleTabs.length > 0) {
      const initialStatus = visibleTabs[0] as ITaskFilterStatus;
      if (!visibleTabs.includes(filterStatus)) {
        // If current status is not in visible tabs, switch to first visible tab
        setFilterStatus(initialStatus);
        setPage(0);
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
        <title> Tasks: List | Minimal UI</title>
      </Helmet>

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        message="You need an active subscription to create tasks. Please subscribe to continue."
        buttonText="Subscribe Now"
        onClose={() => setSubscriptionDialogOpen(false)}
        onButtonClick={() => {
          setSubscriptionDialogOpen(false);
          navigate(PATH_DASHBOARD.subscription);
        }}
      />

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Task List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Tasks', href: PATH_DASHBOARD.tasks.root },
            { name: 'List' },
          ]}
          action={
            <PermissionGuard permission="create_tasks">
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => {
                  if (!hasSubscription()) {
                    setSubscriptionDialogOpen(true);
                  } else {
                    navigate(PATH_DASHBOARD.tasks.create);
                  }
                }}
              >
                New Task
              </Button>
            </PermissionGuard>
          }
        />

        <PermissionGuard permission="view_tasks">

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

            <TaskTableToolbar
              isFiltered={isFiltered}
              filterName={filterName}
              filterPriority={filterPriority}
              filterBranch={filterBranch}
              optionsPriority={PRIORITY_OPTIONS}
              showBranchFilter={showBranchFilter}
              onFilterName={handleFilterName}
              onFilterPriority={handleFilterPriority}
              onFilterBranch={handleFilterBranch}
              onResetFilter={handleResetFilter}
              columnVisibility={columnVisibility}
              onToggleColumn={handleToggleColumn}
              tableHead={TABLE_HEAD}
              formInputSx={FORM_INPUT_SX}
            />

{isFetching && <LinearProgress />}

            {/* {isFetching && !isLoading && (
              <LinearProgress
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1100,
                  height: 2,
                }}
              />
            )} */}

            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar sx={{ maxWidth: '100%' }}>
                <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: { xs: 800, md: 960 } }}>
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
                    {isLoading ? (
                      <>
                        {[...Array(rowsPerPage)].map((_, index) => (
                          <TaskTableSkeleton
                            key={index}
                            columnVisibility={columnVisibility}
                            dense={dense}
                          />
                        ))}
                      </>
                    ) : isError ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 10 }}>
                          <Alert severity="error">
                            {error instanceof Error ? error.message : 'Failed to load tasks. Please try again.'}
                          </Alert>
                        </TableCell>
                      </TableRow>
                    ) : isNotFound ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 10 }}>
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
                    ) : dataFiltered.length > 0 ? (
                      <>
                        {dataFiltered.map((row) => (
                        <TaskTableRow
                          key={row.id}
                          row={row}
                          userId={user?.id}
                          onViewRow={() => handleViewRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onDeleteRow={() => handlePermanentDeleteRow(row.id)}
                          onArchiveRow={() => handleArchiveRow(row.id)}
                          onRestoreRow={() => handleRestoreRow(row.id)}
                          onStatusUpdate={(statusValue: string) => handleStatusUpdate(row.id, statusValue)}
                          filterStatus={filterStatus}
                          columnVisibility={columnVisibility}
                          dense={dense}
                          canEdit={hasPermission('edit_tasks')}
                          canDelete={hasPermission('delete_tasks')}
                          isLoading={loadingTaskId === row.id}
                        />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)}
                        />
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 10 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h6"
                              paragraph
                              sx={{
                                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                                fontWeight: 700,
                              }}
                            >
                              No tasks found
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                              }}
                            >
                              Get started by creating a new task.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            {totalPages > 1 && (
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
            )}
          </Card>
        </PermissionGuard>
      </Container>
    </>
  );
}

