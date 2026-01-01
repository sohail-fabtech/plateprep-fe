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
import { IRestaurantLocation, IRestaurantLocationFilterStatus } from '../../@types/restaurantLocation';
// _mock_
import { _restaurantLocationList } from '../../_mock/arrays';
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
import { RestaurantLocationTableRow, RestaurantLocationTableToolbar } from '../../sections/@dashboard/restaurantLocation/list';
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
  { id: '', label: 'Action', align: 'right' },
];

// Default column visibility
const DEFAULT_COLUMN_VISIBILITY = {
  id: true,
  branchName: true,
  branchLocation: true,
  phoneNumber: true,
  socialLinks: true,
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

  const [tableData, setTableData] = useState(_restaurantLocationList);
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<IRestaurantLocationFilterStatus>('all');
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

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterStatus,
  });

  const isFiltered = filterName !== '';

  const isNotFound = (!dataFiltered.length && !!filterName) || (!dataFiltered.length && isFiltered);

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

  const handleDeleteRow = (id: number) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setTableData(deleteRow);
    enqueueSnackbar('Location deleted successfully!', { variant: 'success' });
  };

  const handleArchiveRow = (id: number) => {
    const updatedData = tableData.map((row) =>
      row.id === id ? { ...row, isDeleted: true } : row
    );
    setTableData(updatedData);
    enqueueSnackbar('Location archived successfully!', { variant: 'success' });
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
        <title> Restaurant Locations: List | Minimal UI</title>
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
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <RestaurantLocationTableRow
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
  filterStatus,
}: {
  tableData: IRestaurantLocation[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterStatus: IRestaurantLocationFilterStatus;
}) {
  const stabilizedThis = tableData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let dataFiltered = stabilizedThis.map((el) => el[0]);

  // Filter by status
  if (filterStatus === 'archived') {
    dataFiltered = dataFiltered.filter((location) => location.isDeleted);
  } else if (filterStatus === 'active') {
    dataFiltered = dataFiltered.filter((location) => !location.isDeleted);
  } else if (filterStatus === 'all') {
    dataFiltered = dataFiltered.filter((location) => !location.isDeleted);
  }

  // Filter by search name (searches both location name and address)
  if (filterName) {
    dataFiltered = dataFiltered.filter(
      (location) =>
        location.branchName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        location.branchLocation.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return dataFiltered;
}
