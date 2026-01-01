import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
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
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { ITask, ITaskFilterStatus } from '../../@types/task';
// _mock_
import { _taskList } from '../../_mock/arrays';
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
import { TaskTableRow, TaskTableToolbar } from '../../sections/@dashboard/task/list';
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

const STATUS_OPTIONS: ITaskFilterStatus[] = ['all', 'draft', 'active', 'archived'];

const PRIORITY_OPTIONS = ['all', 'low', 'medium', 'high', 'urgent'];

// Table head configuration
const TABLE_HEAD = [
  { id: 'staffName', label: 'Staff Name', align: 'left' },
  { id: 'taskName', label: 'Task Name', align: 'left' },
  { id: 'taskDescription', label: 'Task Description', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'priority', label: 'Priority Level', align: 'left' },
  { id: '', label: 'Action', align: 'right' },
];

// Default column visibility
const DEFAULT_COLUMN_VISIBILITY = {
  staffName: true,
  taskName: true,
  taskDescription: true,
  status: true,
  priority: true,
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

  const [tableData, setTableData] = useState(_taskList);

  const [filterName, setFilterName] = useState('');

  const [filterPriority, setFilterPriority] = useState('all');

  const [filterStatus, setFilterStatus] = useState<ITaskFilterStatus>('all');

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

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterPriority,
    filterStatus,
  });

  const isFiltered = filterName !== '' || filterPriority !== 'all';

  const isNotFound = (!dataFiltered.length && !!filterName) || (!dataFiltered.length && isFiltered);

  const denseHeight = dense ? 52 : 72;

  const handleFilterStatus = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: ITaskFilterStatus
  ) => {
    setPage(0);
    setFilterStatus(newValue);
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

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setTableData(deleteRow);
    enqueueSnackbar('Task deleted successfully!', { variant: 'success' });
  };

  const handleArchiveRow = (id: string) => {
    const updatedData = tableData.map((row) =>
      row.id === id ? { ...row, isArchived: true } : row
    );
    setTableData(updatedData);
    enqueueSnackbar('Task archived successfully!', { variant: 'success' });
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterPriority('all');
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
        <title> Tasks: List | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Task List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Tasks', href: PATH_DASHBOARD.tasks.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              to={PATH_DASHBOARD.tasks.create}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Task
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

          <TaskTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            filterPriority={filterPriority}
            optionsPriority={PRIORITY_OPTIONS}
            onFilterName={handleFilterName}
            onFilterPriority={handleFilterPriority}
            onResetFilter={handleResetFilter}
            columnVisibility={columnVisibility}
            onToggleColumn={handleToggleColumn}
            tableHead={TABLE_HEAD}
            formInputSx={FORM_INPUT_SX}
          />

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
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TaskTableRow
                        key={row.id}
                        row={row}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onArchiveRow={() => handleArchiveRow(row.id)}
                        filterStatus={filterStatus}
                        columnVisibility={columnVisibility}
                        dense={dense}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)}
                  />

                  {isNotFound && (
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
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
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

// ----------------------------------------------------------------------

function applySortFilter({
  tableData,
  comparator,
  filterName,
  filterPriority,
  filterStatus,
}: {
  tableData: ITask[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterPriority: string;
  filterStatus: ITaskFilterStatus;
}) {
  const stabilizedThis = tableData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tableData = stabilizedThis.map((el) => el[0]);

  // Filter by status
  if (filterStatus === 'archived') {
    tableData = tableData.filter((task) => task.isArchived);
  } else if (filterStatus === 'active') {
    tableData = tableData.filter(
      (task) => !task.isArchived && (task.status === 'in-progress' || task.status === 'pending')
    );
  } else if (filterStatus === 'draft') {
    tableData = tableData.filter((task) => !task.isArchived && task.status === 'pending');
  } else if (filterStatus === 'all') {
    tableData = tableData.filter((task) => !task.isArchived);
  }

  // Filter by search name (searches both staff name and task name)
  if (filterName) {
    tableData = tableData.filter(
      (task) =>
        task.taskName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        task.staffName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  // Filter by priority
  if (filterPriority !== 'all') {
    tableData = tableData.filter((task) => task.priority === filterPriority);
  }

  return tableData;
}
