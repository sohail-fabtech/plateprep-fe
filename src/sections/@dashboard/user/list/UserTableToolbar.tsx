import { useState } from 'react';
import {
  Stack,
  InputAdornment,
  TextField,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  Box,
  MenuItem,
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import BranchSelect from '../../../../components/branch-select/BranchSelect';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  filterRole: string;
  filterLocation: string;
  filterBranch?: string | number | '';
  showBranchFilter?: boolean;
  isFiltered: boolean;
  optionsRole: string[];
  optionsLocation: string[];
  onResetFilter: VoidFunction;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterRole: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterLocation: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterBranch?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string) => void;
  tableHead: { id: string; label?: string; tooltip?: string }[];
  formInputSx?: object;
};

export default function UserTableToolbar({
  isFiltered,
  filterName,
  filterRole,
  filterLocation,
  filterBranch,
  showBranchFilter,
  optionsRole,
  optionsLocation,
  onFilterName,
  onFilterRole,
  onFilterLocation,
  onFilterBranch,
  onResetFilter,
  columnVisibility,
  onToggleColumn,
  tableHead,
  formInputSx,
}: Props) {
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <Stack
        spacing={{ xs: 1.5, md: 2 }}
        alignItems="center"
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 2, md: 3 } }}
      >
        {showBranchFilter && (
          <BranchSelect
            value={filterBranch || ''}
            onChange={(e) => {
              if (onFilterBranch) {
                const value = e.target.value;
                const syntheticEvent = {
                  target: { value },
                } as React.ChangeEvent<HTMLInputElement>;
                onFilterBranch(syntheticEvent);
              }
            }}
            label="Location"
            formInputSx={{
              width: '100%',
              maxWidth: { sm: 240 },
              ...formInputSx,
            }}
          />
        )}

        <TextField
          fullWidth
          select
          label="Location"
          value={filterLocation}
          onChange={onFilterLocation}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  maxHeight: 260,
                },
              },
            },
          }}
          sx={{
            maxWidth: { sm: 240 },
            ...formInputSx,
          }}
        >
          <MenuItem
            value="all"
            sx={{
              mx: 1,
              borderRadius: 0.75,
              typography: 'body2',
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          >
            All Locations
          </MenuItem>
          {optionsLocation.map((option) => (
            <MenuItem
              key={option}
              value={option}
              sx={{
                mx: 1,
                borderRadius: 0.75,
                typography: 'body2',
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          value={filterName}
          onChange={onFilterName}
          placeholder="Search user name, email, or address..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={formInputSx}
        />

        {/* Column Visibility Button - Icon + Text on mobile, Icon only on desktop */}
        <Button
          variant="outlined"
          onClick={handleOpenPopover}
          startIcon={<Iconify icon="eva:options-2-outline" />}
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: 'auto', sm: 44 },
            height: { xs: 40, md: 44 },
            fontSize: { xs: '0.8125rem', md: '0.875rem' },
            fontWeight: 600,
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'text.primary',
              bgcolor: 'action.hover',
            },
            '& .MuiButton-startIcon': {
              margin: { xs: '0 8px 0 0', sm: 0 },
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            Columns
          </Box>
        </Button>

        {isFiltered && (
          <Button
            color="error"
            variant="soft"
            sx={{
              flexShrink: 0,
              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              minWidth: { xs: 80, sm: 100 },
              width: { xs: '100%', sm: 'auto' },
              height: { xs: 40, md: 44 },
              fontWeight: 600,
            }}
            onClick={onResetFilter}
            startIcon={<Iconify icon="eva:trash-2-outline" />}
          >
            Clear
          </Button>
        )}
      </Stack>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 220, p: 0 }}>
        <Stack sx={{ p: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              px: 1,
              py: 1,
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              fontWeight: 700,
            }}
          >
            Show Columns
          </Typography>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {tableHead
            .filter((column) => column.id !== '')
            .map((column) => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={columnVisibility[column.id]}
                    onChange={() => onToggleColumn(column.id)}
                    size="small"
                  />
                }
                label={column.label}
                sx={{
                  px: 1,
                  py: 0.5,
                  '& .MuiFormControlLabel-label': {
                    fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  },
                }}
              />
            ))}
        </Stack>
      </MenuPopover>
    </>
  );
}
