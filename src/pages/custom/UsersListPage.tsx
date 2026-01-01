import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
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
import { IUser, IUserFilterStatus } from '../../@types/user';
// _mock_
import { _userList } from '../../_mock/arrays';
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
import { UserTableRow, UserTableToolbar } from '../../sections/@dashboard/user/list';
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
};

// LocalStorage keys specific to users table
const USERS_COLUMN_VISIBILITY_KEY = 'usersTableColumnVisibility';
const USERS_DENSE_KEY = 'usersTableDense';

// ----------------------------------------------------------------------

export default function UsersListPage() {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('location');

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
    defaultDense: (() => {
      try {
        const saved = localStorage.getItem(USERS_DENSE_KEY);
        return saved ? JSON.parse(saved) : false;
      } catch {
        return false;
      }
    })(),
  });

  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Transform _userList to IUser format
  const [tableData, setTableData] = useState<IUser[]>(() => {
    return _userList.map((user) => {
      // Build address from available fields
      const addressParts = [
        user.address,
        user.city,
        user.state,
        user.zipCode,
      ].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '-';

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: fullAddress,
        location: user.company || '-', // Using company as location for now, can be updated when API provides location
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        isDeleted: false, // Default to not deleted
      };
    });
  });

  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState<IUserFilterStatus>('all');

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

  // Filter by location if locationId is provided
  useEffect(() => {
    if (locationId) {
      // TODO: Filter users by location when API is integrated
      console.log('Filtering users by location:', locationId);
    }
  }, [locationId]);

  // Get unique locations from tableData
  const locationOptions = useMemo(() => {
    const locations = Array.from(
      new Set(tableData.map((user) => user.location).filter((loc): loc is string => Boolean(loc)))
    );
    return locations.sort();
  }, [tableData]);

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterRole,
    filterLocation,
    filterStatus,
  });

  const isFiltered = filterName !== '' || filterRole !== 'all' || filterLocation !== 'all';

  const isNotFound = (!dataFiltered.length && !!filterName) || (!dataFiltered.length && isFiltered);

  const denseHeight = dense ? 52 : 72;

  const handleFilterStatus = (event: React.SyntheticEvent<Element, Event>, newValue: IUserFilterStatus) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterRole(event.target.value);
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

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setTableData(deleteRow);
    enqueueSnackbar('User deleted successfully!', { variant: 'success' });
  };

  const handleArchiveRow = (id: string) => {
    const updatedData = tableData.map((row) => (row.id === id ? { ...row, isDeleted: true } : row));
    setTableData(updatedData);
    enqueueSnackbar('User archived successfully!', { variant: 'success' });
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterRole('all');
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
            <Button
              component={RouterLink}
              to={PATH_DASHBOARD.users.create}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New User
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

          <UserTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            filterRole={filterRole}
            filterLocation={filterLocation}
            optionsRole={ROLE_OPTIONS}
            optionsLocation={locationOptions}
            onFilterName={handleFilterName}
            onFilterRole={handleFilterRole}
            onFilterLocation={handleFilterLocation}
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
                      <UserTableRow
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

                  <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)} />

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
            count={dataFiltered.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            dense={dense}
            onChangeDense={onChangeDense}
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
  filterRole,
  filterLocation,
  filterStatus,
}: {
  tableData: IUser[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterRole: string;
  filterLocation: string;
  filterStatus: IUserFilterStatus;
}) {
  const stabilizedThis = tableData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  // Filter by name, email, or address
  if (filterName) {
    filteredData = filteredData.filter(
      (user) =>
        user.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        user.email.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        (user.address && user.address.toLowerCase().indexOf(filterName.toLowerCase()) !== -1)
    );
  }

  // Filter by role
  if (filterRole !== 'all') {
    filteredData = filteredData.filter((user) => user.role.toLowerCase() === filterRole.toLowerCase());
  }

  // Filter by location
  if (filterLocation !== 'all') {
    filteredData = filteredData.filter((user) => user.location?.toLowerCase() === filterLocation.toLowerCase());
  }

  // Filter by status (archived/active)
  if (filterStatus === 'archived') {
    filteredData = filteredData.filter((user) => user.isDeleted === true);
  } else if (filterStatus === 'active') {
    filteredData = filteredData.filter((user) => user.isDeleted !== true);
  }

  return filteredData;
}

