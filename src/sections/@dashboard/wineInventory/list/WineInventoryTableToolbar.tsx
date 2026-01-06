import { useState } from 'react';
import {
  Stack,
  InputAdornment,
  TextField,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  Box,
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import BranchSelect from '../../../../components/branch-select/BranchSelect';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  filterWineType: string;
  filterRegion: string;
  filterStockStatus: string;
  filterLocation: string | number | '';
  isFiltered: boolean;
  optionsWineType: string[];
  optionsRegion: string[];
  optionsStockStatus: string[];
  onResetFilter: VoidFunction;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterWineType: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterRegion: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterStockStatus: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterLocation?: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string) => void;
  tableHead: { id: string; label?: string; tooltip?: string }[];
  formInputSx?: object;
  showBranchFilter?: boolean;
};

export default function WineInventoryTableToolbar({
  isFiltered,
  filterName,
  filterWineType,
  filterRegion,
  filterStockStatus,
  filterLocation,
  optionsWineType,
  optionsRegion,
  optionsStockStatus,
  onFilterName,
  onFilterWineType,
  onFilterRegion,
  onFilterStockStatus,
  onFilterLocation,
  onResetFilter,
  columnVisibility,
  onToggleColumn,
  tableHead,
  formInputSx,
  showBranchFilter = false,
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
        <TextField
          fullWidth
          select
          label="Wine Type"
          value={filterWineType}
          onChange={onFilterWineType}
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
            maxWidth: { sm: 200 },
            textTransform: 'capitalize',
            ...formInputSx,
          }}
        >
          {optionsWineType.map((option) => (
            <MenuItem
              key={option}
              value={option}
              sx={{
                mx: 1,
                borderRadius: 0.75,
                typography: 'body2',
                textTransform: 'capitalize',
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          select
          label="Region"
          value={filterRegion}
          onChange={onFilterRegion}
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
            maxWidth: { sm: 200 },
            ...formInputSx,
          }}
        >
          {optionsRegion.map((option) => (
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
          select
          label="Stock Status"
          value={filterStockStatus}
          onChange={onFilterStockStatus}
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
            maxWidth: { sm: 180 },
            textTransform: 'capitalize',
            ...formInputSx,
          }}
        >
          {optionsStockStatus.map((option) => (
            <MenuItem
              key={option}
              value={option}
              sx={{
                mx: 1,
                borderRadius: 0.75,
                typography: 'body2',
                textTransform: 'capitalize',
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {option}
            </MenuItem>
          ))}
        </TextField>

        {showBranchFilter && onFilterLocation && (
          <Box sx={{ maxWidth: { sm: 200 }, width: '100%' }}>
            <BranchSelect
              value={filterLocation || ''}
              onChange={onFilterLocation}
              label="Location"
              formInputSx={formInputSx}
            />
          </Box>
        )}

        <TextField
          fullWidth
          value={filterName}
          onChange={onFilterName}
          placeholder="Search wine name or producer..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={formInputSx}
        />

        {/* Column Visibility Button */}
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
