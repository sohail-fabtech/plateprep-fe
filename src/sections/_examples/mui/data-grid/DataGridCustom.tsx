import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Box, Rating, LinearProgress, IconButton, Tooltip } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridSelectionModel,
  getGridNumericOperators,
  GridFilterInputValueProps,
} from '@mui/x-data-grid';
import type { GridColumnVisibilityModel } from '@mui/x-data-grid';
// utils
import { fPercent } from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import { CustomAvatar } from '../../../../components/custom-avatar';

// ----------------------------------------------------------------------

// Column descriptions for tooltips
const columnDescriptions = {
  id: 'Unique identifier for each row',
  avatar: 'User profile avatar',
  name: 'Full name of the user (editable)',
  email: 'User email address (editable)',
  lastLogin: 'Last time the user logged in',
  rating: 'User rating from 0 to 5 stars',
  status: 'Current user status (online, away, or busy)',
  isAdmin: 'Whether the user has admin privileges',
  performance: 'User performance percentage',
  action: 'Actions menu',
};

const columns: GridColDef[] = [
  // OPTIONS
  // https://mui.com/x/api/data-grid/grid-col-def/#main-content
  // - hide: false (default)
  // - editable: false (default)
  // - filterable: true (default)
  // - sortable: true (default)
  // - disableColumnMenu: false (default)

  // FIELD TYPES
  // --------------------
  // 'string' (default)
  // 'number'
  // 'date'
  // 'dateTime'
  // 'boolean'
  // 'singleSelect'

  {
    field: 'id',
    hide: true,
    renderHeader: () => (
      <Tooltip title={columnDescriptions.id} placement="top" arrow>
        <Box sx={{ cursor: 'help' }}>ID</Box>
      </Tooltip>
    ),
  },
  {
    field: 'avatar',
    headerName: 'Avatar',
    align: 'center',
    headerAlign: 'center',
    width: 64,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderHeader: () => (
      <Tooltip title={columnDescriptions.avatar} placement="top" arrow>
        <Box sx={{ cursor: 'help' }}>Avatar</Box>
      </Tooltip>
    ),
    renderCell: (params) => <CustomAvatar name={params.row.name} sx={{ width: 36, height: 36 }} />,
  },
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    editable: true,
    renderHeader: () => (
      <Tooltip title={columnDescriptions.name} placement="top" arrow>
        <Box sx={{ cursor: 'help' }}>Name</Box>
      </Tooltip>
    ),
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1,
    editable: true,
    renderHeader: () => (
      <Tooltip title={columnDescriptions.email} placement="top" arrow>
        <Box sx={{ cursor: 'help' }}>Email</Box>
      </Tooltip>
    ),
    renderCell: (params) => (
      <Typography variant="body2" sx={{ textDecoration: 'underline' }} noWrap>
        {params.row.email}
      </Typography>
    ),
  },
  {
    field: 'lastLogin',
    type: 'dateTime',
    headerName: 'Last login',
    align: 'right',
    headerAlign: 'right',
    width: 200,
    renderHeader: () => (
      <Tooltip title={columnDescriptions.lastLogin} placement="top" arrow>
        <Box sx={{ cursor: 'help' }}>Last login</Box>
      </Tooltip>
    ),
  },
  {
    field: 'rating',
    type: 'number',
    headerName: 'Rating',
    width: 160,
    disableColumnMenu: true,
    renderHeader: () => (
      <Tooltip title={columnDescriptions.rating} placement="top" arrow>
        <Box sx={{ cursor: 'help' }}>Rating</Box>
      </Tooltip>
    ),
    renderCell: (params) => (
      <Rating size="small" value={params.row.rating} precision={0.5} readOnly />
    ),
  },
  {
    field: 'status',
    type: 'singleSelect',
    headerName: 'Status',
    valueOptions: ['online', 'away', 'busy'],
    align: 'center',
    headerAlign: 'center',
    width: 120,
    renderHeader: () => (
      <Tooltip title={columnDescriptions.status} placement="top" arrow>
        <Box sx={{ cursor: 'help' }}>Status</Box>
      </Tooltip>
    ),
    renderCell: (params) => RenderStatus(params.row.status),
  },
  {
    field: 'isAdmin',
    type: 'boolean',
    align: 'center',
    headerAlign: 'center',
    width: 120,
    renderHeader: () => (
      <Tooltip title={columnDescriptions.isAdmin} placement="top" arrow>
        <Box sx={{ cursor: 'help' }}>Is Admin</Box>
      </Tooltip>
    ),
    renderCell: (params) =>
      params.row.isAdmin ? (
        <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'primary.main' }} />
      ) : (
        '-'
      ),
  },
  {
    field: 'performance',
    type: 'number',
    headerName: 'Performance',
    align: 'center',
    headerAlign: 'center',
    width: 160,
    renderHeader: () => (
      <Tooltip title={columnDescriptions.performance} placement="top" arrow>
        <Box sx={{ cursor: 'help' }}>Performance</Box>
      </Tooltip>
    ),
    renderCell: (params) => (
      <Stack spacing={1} direction="row" alignItems="center" sx={{ px: 1, width: 1, height: 1 }}>
        <LinearProgress
          value={params.row.performance}
          variant="determinate"
          color={
            (params.row.performance < 30 && 'error') ||
            (params.row.performance > 30 && params.row.performance < 70 && 'warning') ||
            'primary'
          }
          sx={{ width: 1, height: 6 }}
        />
        <Typography variant="caption" sx={{ width: 80 }}>
          {fPercent(params.row.performance)}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'action',
    headerName: ' ',
    align: 'right',
    width: 80,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderHeader: () => (
      <Tooltip title={columnDescriptions.action} placement="top" arrow>
        <Box sx={{ cursor: 'help' }}> </Box>
      </Tooltip>
    ),
    renderCell: (params) => (
      <IconButton onClick={() => console.log('ID', params.row.id)}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    ),
  },
];

// ----------------------------------------------------------------------

type Props = {
  data: {
    id: string;
    name: string;
    email: string;
    lastLogin: Date;
    performance: number;
    rating: number;
    status: string;
    isAdmin: boolean;
    lastName: string;
    firstName: string;
    age: number;
  }[];
};

export default function DataGridCustom({ data }: Props) {
  const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
  
  // Column visibility model - hide id, status by default
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false,
    status: false,
  });

  if (columns.length > 0) {
    const ratingColumn = columns.find((column) => column.field === 'rating')!;
    const ratingColIndex = columns.findIndex((col) => col.field === 'rating');

    const ratingFilterOperators = getGridNumericOperators().map((operator) => ({
      ...operator,
      InputComponent: RatingInputValue,
    }));
    columns[ratingColIndex] = {
      ...ratingColumn,
      filterOperators: ratingFilterOperators,
    };
  }

  const selected = data.filter((row) => selectionModel.includes(row.id));

  console.log('SELECTED', selected);

  return (
    <DataGrid
      checkboxSelection
      disableSelectionOnClick
      rows={data}
      columns={columns}
      pagination
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
      onSelectionModelChange={(newSelectionModel) => {
        setSelectionModel(newSelectionModel);
      }}
      components={{
        Toolbar: GridToolbar,
      }}
      componentsProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 500 },
        },
      }}
    />
  );
}

// ----------------------------------------------------------------------

function RenderStatus(getStatus: string) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  return (
    <Label
      variant={isLight ? 'soft' : 'filled'}
      color={(getStatus === 'busy' && 'error') || (getStatus === 'away' && 'warning') || 'success'}
      sx={{ mx: 'auto' }}
    >
      {getStatus}
    </Label>
  );
}

// ----------------------------------------------------------------------

function RatingInputValue({ item, applyValue }: GridFilterInputValueProps) {
  return (
    <Box sx={{ p: 1, height: 1, alignItems: 'flex-end', display: 'flex' }}>
      <Rating
        size="small"
        precision={0.5}
        placeholder="Filter value"
        value={Number(item.value)}
        onChange={(event, newValue) => {
          applyValue({ ...item, value: newValue });
        }}
      />
    </Box>
  );
}
