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
import { IWineInventory, IWineInventoryFilterStatus } from '../../@types/wineInventory';
// _mock_
import { _wineInventoryList } from '../../_mock/arrays';
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
import { WineInventoryTableRow, WineInventoryTableToolbar } from '../../sections/@dashboard/wineInventory/list';
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

const STATUS_OPTIONS: IWineInventoryFilterStatus[] = ['all', 'active', 'archived'];

const WINE_TYPE_OPTIONS = ['all', 'Red', 'White', 'Rosé', 'Sparkling', 'Fortified', 'Dessert'];

const STOCK_STATUS_OPTIONS = ['all', 'IN_STOCK', 'LOW', 'OUT'];

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

  const [tableData, setTableData] = useState(_wineInventoryList);
  const [filterName, setFilterName] = useState('');
  const [filterWineType, setFilterWineType] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterStockStatus, setFilterStockStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState<IWineInventoryFilterStatus>('all');

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

  // Get unique regions and locations from table data
  const regionOptions = ['all', ...Array.from(new Set(tableData.map((wine) => wine.region)))];
  const locationOptions = ['all', ...Array.from(new Set(tableData.map((wine) => wine.location)))];

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterWineType,
    filterRegion,
    filterStockStatus,
    filterLocation,
    filterStatus,
  });

  const isFiltered =
    filterName !== '' ||
    filterWineType !== 'all' ||
    filterRegion !== 'all' ||
    filterStockStatus !== 'all' ||
    filterLocation !== 'all';

  const isNotFound = (!dataFiltered.length && !!filterName) || (!dataFiltered.length && isFiltered);

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

  const handleFilterLocation = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterLocation(event.target.value);
  };

  const handleViewRow = (id: string) => {
    navigate(PATH_DASHBOARD.wineInventory.view(id));
  };

  const handleEditRow = (id: string) => {
    navigate(PATH_DASHBOARD.wineInventory.edit(id));
  };

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setTableData(deleteRow);
    enqueueSnackbar('Wine deleted successfully!', { variant: 'success' });
  };

  const handleArchiveRow = (id: string) => {
    const updatedData = tableData.map((row) => (row.id === id ? { ...row, isDeleted: true } : row));
    setTableData(updatedData);
    enqueueSnackbar('Wine archived successfully!', { variant: 'success' });
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterWineType('all');
    setFilterRegion('all');
    setFilterStockStatus('all');
    setFilterLocation('all');
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
        <title> Wine Inventory: List | Minimal UI</title>
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
            filterLocation={filterLocation}
            optionsWineType={WINE_TYPE_OPTIONS}
            optionsRegion={regionOptions}
            optionsStockStatus={STOCK_STATUS_OPTIONS}
            optionsLocation={locationOptions}
            onFilterName={handleFilterName}
            onFilterWineType={handleFilterWineType}
            onFilterRegion={handleFilterRegion}
            onFilterStockStatus={handleFilterStockStatus}
            onFilterLocation={handleFilterLocation}
            onResetFilter={handleResetFilter}
            columnVisibility={columnVisibility}
            onToggleColumn={handleToggleColumn}
            tableHead={TABLE_HEAD}
            formInputSx={FORM_INPUT_SX}
          />

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
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <WineInventoryTableRow
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
  filterWineType,
  filterRegion,
  filterStockStatus,
  filterLocation,
  filterStatus,
}: {
  tableData: IWineInventory[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterWineType: string;
  filterRegion: string;
  filterStockStatus: string;
  filterLocation: string;
  filterStatus: IWineInventoryFilterStatus;
}) {
  const stabilizedThis = tableData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let inputData = stabilizedThis.map((el) => el[0]);

  // Filter by status (all, active, archived)
  if (filterStatus === 'archived') {
    inputData = inputData.filter((wine) => wine.isDeleted);
  } else if (filterStatus === 'active') {
    inputData = inputData.filter((wine) => !wine.isDeleted);
  }

  // Filter by name (wine name or producer)
  if (filterName) {
    const searchLower = filterName.toLowerCase();
    inputData = inputData.filter(
      (wine) =>
        wine.wineName.toLowerCase().indexOf(searchLower) !== -1 ||
        (wine.producer && wine.producer.toLowerCase().indexOf(searchLower) !== -1)
    );
  }

  // Filter by wine type
  if (filterWineType !== 'all') {
    inputData = inputData.filter((wine) => wine.wineType === filterWineType);
  }

  // Filter by region
  if (filterRegion !== 'all') {
    inputData = inputData.filter((wine) => wine.region === filterRegion);
  }

  // Filter by stock status
  if (filterStockStatus !== 'all') {
    inputData = inputData.filter((wine) => wine.stockStatus === filterStockStatus);
  }

  // Filter by location
  if (filterLocation !== 'all') {
    inputData = inputData.filter((wine) => wine.location === filterLocation);
  }

  return inputData;
}
