import { useState } from 'react';
// @mui
import { Box, Tooltip } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridColumnVisibilityModel,
  DataGridProps,
} from '@mui/x-data-grid';

// ----------------------------------------------------------------------

type Props = DataGridProps & {
  columns: GridColDef[];
  rows: any[];
  initialHiddenColumns?: string[];
  columnDescriptions?: Record<string, string>;
};

export default function DataGridWithVisibility({
  columns,
  rows,
  initialHiddenColumns = [],
  columnDescriptions = {},
  ...other
}: Props) {
  // Create initial column visibility model
  const initialVisibilityModel: GridColumnVisibilityModel = {};
  initialHiddenColumns.forEach((columnField) => {
    initialVisibilityModel[columnField] = false;
  });

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(initialVisibilityModel);

  // Enhance columns with tooltips if descriptions are provided
  const enhancedColumns: GridColDef[] = columns.map((col) => ({
    ...col,
    renderHeader: (params) => (
      <Tooltip
        title={columnDescriptions[col.field] || col.headerName || col.field}
        placement="top"
        arrow
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            cursor: 'help',
          }}
        >
          {col.headerName || col.field}
        </Box>
      </Tooltip>
    ),
  }));

  return (
    <DataGrid
      rows={rows}
      columns={enhancedColumns}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
      components={{
        Toolbar: GridToolbar,
      }}
      componentsProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 500 },
        },
      }}
      {...other}
    />
  );
}

