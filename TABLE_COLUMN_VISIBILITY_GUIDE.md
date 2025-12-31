# Table Column Visibility & Tooltips Guide

## Overview

Each page in this application has **its own table** - there is no central table component. We've added column visibility and tooltip features that you can implement on any page.

## Two Approaches

### Approach 1: Use the Pre-built Component

We've created a reusable component: `DataGridWithVisibility`

**Location:** `/src/components/table/DataGridWithVisibility.tsx`

**Usage Example:**

```tsx
import { DataGridWithVisibility } from '../../components/table';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'status', headerName: 'Status', width: 120 },
];

const rows = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
];

export default function MyPage() {
  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGridWithVisibility
        columns={columns}
        rows={rows}
        initialHiddenColumns={['id', 'status']}  // Hide these columns by default
        columnDescriptions={{
          id: 'Unique identifier for each row',
          name: 'Full name of the user',
          email: 'User email address',
          status: 'Current user status',
        }}
        checkboxSelection
        disableSelectionOnClick
        pagination
      />
    </Box>
  );
}
```

### Approach 2: Enhanced Existing DataGrid (Used in Examples)

We've enhanced the existing `DataGridCustom` component to show you how to add these features to any DataGrid.

**Location:** `/src/sections/_examples/mui/data-grid/DataGridCustom.tsx`

**Key Features Added:**
1. **Column Visibility** - Hide/show columns using the toolbar
2. **Tooltips on Hover** - Hover over any column header to see its description

**To see it in action:**
1. Go to: http://localhost:3000/components/mui/data-grid
2. Look at the "Custom" DataGrid example
3. Click the "Columns" button in the toolbar to hide/show columns
4. Hover over column headers to see tooltips

## Implementation Details

### 1. Column Visibility

Add these imports:
```tsx
import { GridColumnVisibilityModel } from '@mui/x-data-grid';
```

Add state:
```tsx
const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
  id: false,        // Hidden by default
  status: false,    // Hidden by default
  // other columns will be visible by default
});
```

Add to DataGrid props:
```tsx
<DataGrid
  columnVisibilityModel={columnVisibilityModel}
  onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
  components={{
    Toolbar: GridToolbar,  // This adds the toolbar with column visibility button
  }}
  // ... other props
/>
```

### 2. Tooltips on Column Headers

For each column, add a `renderHeader` function:

```tsx
{
  field: 'name',
  headerName: 'Name',
  flex: 1,
  renderHeader: () => (
    <Tooltip title="Full name of the user (editable)" placement="top" arrow>
      <Box sx={{ cursor: 'help' }}>Name</Box>
    </Tooltip>
  ),
}
```

## MUI Documentation References

- [DataGrid Column Visibility](https://mui.com/x/react-data-grid/column-visibility/)
- [DataGrid Columns Documentation](https://mui.com/x/api/data-grid/grid-col-def/)
- [DataGrid Toolbar](https://mui.com/x/react-data-grid/components/#toolbar)
- [Tooltip Component](https://mui.com/material-ui/react-tooltip/)

## Where Tables Are Used

Here are the pages that currently use tables:

### DataGrid (MUI X):
- `/components/mui/data-grid` - Example page with DataGrid

### Custom Tables (MUI Table):
- `/dashboard/user/list` - User list table
- `/dashboard/invoice/list` - Invoice list table
- `/dashboard/e-commerce/list` - Product list table
- `/dashboard/file` - File manager list view

## Adding to Your Custom Pages

If you want to add a table with column visibility to any of your custom pages (Recipes, Wine Inventory, Tasks, etc.):

1. **Install MUI X DataGrid** (if not already installed):
   ```bash
   npm install @mui/x-data-grid
   ```

2. **Use the component:**
   ```tsx
   import { DataGridWithVisibility } from '../../components/table';
   
   // Define your columns and rows
   // Use the component as shown in Approach 1 above
   ```

## Notes

- **Column Visibility Button:** Users can click the "Columns" button in the toolbar to show/hide columns
- **Tooltips:** Hover over any column header to see its description
- **Quick Filter:** The toolbar also includes a quick search/filter box
- **No Central Table:** Each page manages its own table data and configuration
- **Existing Functionality:** All other table features (sorting, filtering, pagination, etc.) remain unchanged

