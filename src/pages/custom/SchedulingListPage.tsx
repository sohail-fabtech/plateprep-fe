import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import {
  Card,
  Table,
  Button,
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
import { IScheduling } from '../../@types/scheduling';
// _mock_
import { _schedulingList } from '../../_mock/arrays';
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
import { SchedulingTableRow, SchedulingTableToolbar } from '../../sections/@dashboard/scheduling/list';
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

// Table head configuration
const TABLE_HEAD = [
  { id: 'dishName', label: 'Dish Name', align: 'left' },
  { id: 'scheduleDatetime', label: 'Schedule Date & Time', align: 'left' },
  { id: 'season', label: 'Season', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'holiday', label: 'Holiday', align: 'left' },
  { id: 'createdAt', label: 'Created At', align: 'left' },
  { id: '', label: 'Action', align: 'right' },
];

// Default column visibility
const DEFAULT_COLUMN_VISIBILITY = {
  dishName: true,
  scheduleDatetime: true,
  season: true,
  status: true,
  holiday: true,
  createdAt: true,
};

// LocalStorage keys specific to scheduling table
const SCHEDULING_COLUMN_VISIBILITY_KEY = 'schedulingTableColumnVisibility';
const SCHEDULING_DENSE_KEY = 'schedulingTableDense';

// ----------------------------------------------------------------------

export default function SchedulingListPage() {
  // Initialize dense from localStorage
  const getDenseFromStorage = (): boolean => {
    try {
      const saved = localStorage.getItem(SCHEDULING_DENSE_KEY);
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
    defaultOrderBy: 'dishName',
    defaultDense: (() => {
      try {
        const saved = localStorage.getItem(SCHEDULING_DENSE_KEY);
        return saved ? JSON.parse(saved) : false;
      } catch {
        return false;
      }
    })(),
  });

  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [tableData, setTableData] = useState<IScheduling[]>(_schedulingList);

  const [filterName, setFilterName] = useState('');

  // Initialize column visibility from localStorage
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(SCHEDULING_COLUMN_VISIBILITY_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_COLUMN_VISIBILITY;
    } catch (error) {
      console.error('Error loading column visibility from localStorage:', error);
      return DEFAULT_COLUMN_VISIBILITY;
    }
  });

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SCHEDULING_COLUMN_VISIBILITY_KEY, JSON.stringify(columnVisibility));
    } catch (error) {
      console.error('Error saving column visibility to localStorage:', error);
    }
  }, [columnVisibility]);

  // Save dense mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SCHEDULING_DENSE_KEY, JSON.stringify(dense));
    } catch (error) {
      console.error('Error saving dense mode to localStorage:', error);
    }
  }, [dense]);

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    orderBy,
    order,
  });

  const isFiltered = filterName !== '';

  const isNotFound = !dataFiltered.length && !!filterName;

  const denseHeight = dense ? 52 : 72;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleDeleteRow = (id: number) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setTableData(deleteRow);
    enqueueSnackbar('Scheduling deleted successfully!', { variant: 'success' });
  };

  const handleStatusUpdate = (id: number) => {
    // TODO: Open status update dialog/menu
    console.log('Update status for scheduling:', id);
    enqueueSnackbar('Status update functionality coming soon', { variant: 'info' });
  };

  const handleResetFilter = () => {
    setFilterName('');
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
        <title> Scheduling: List | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Scheduling List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Scheduling', href: PATH_DASHBOARD.scheduling.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              to={PATH_DASHBOARD.scheduling.create}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Schedule
            </Button>
          }
        />

        <Card sx={{ mb: { xs: 2, md: 3 }, overflow: 'hidden' }}>
          <SchedulingTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            onFilterName={handleFilterName}
            onResetFilter={handleResetFilter}
            columnVisibility={columnVisibility}
            onToggleColumn={handleToggleColumn}
            tableHead={TABLE_HEAD}
            formInputSx={FORM_INPUT_SX}
          />

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
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <SchedulingTableRow
                        key={row.id}
                        row={row}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onStatusUpdate={() => handleStatusUpdate(row.id)}
                        columnVisibility={columnVisibility}
                        dense={dense}
                      />
                    ))}

                  <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)} />

                  {isNotFound && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 10 }}>
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
                              : 'Get started by creating your first scheduling.'}
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
  orderBy,
  order,
}: {
  tableData: IScheduling[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  orderBy: string;
  order: 'asc' | 'desc';
}) {
  // Create a custom comparator that handles nested properties
  const customComparator = (a: IScheduling, b: IScheduling) => {
    let aValue: any;
    let bValue: any;

    // Handle nested properties
    switch (orderBy) {
      case 'dishName':
        aValue = a.dish.name.toLowerCase();
        bValue = b.dish.name.toLowerCase();
        break;
      case 'status':
        aValue = a.status.name.toLowerCase();
        bValue = b.status.name.toLowerCase();
        break;
      case 'holiday':
        aValue = a.holiday?.name?.toLowerCase() || '';
        bValue = b.holiday?.name?.toLowerCase() || '';
        break;
      default:
        // For flat properties, use the original comparator
        return comparator(a, b);
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  };

  const stabilizedThis = tableData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const sortOrder = customComparator(a[0], b[0]);
    if (sortOrder !== 0) return sortOrder;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  // Filter by dish name
  if (filterName) {
    filteredData = filteredData.filter(
      (scheduling) =>
        scheduling.dish.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return filteredData;
}

