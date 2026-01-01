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
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  isFiltered: boolean;
  onResetFilter: VoidFunction;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string) => void;
  tableHead: { id: string; label?: string; tooltip?: string }[];
  formInputSx?: object;
};

export default function AccessLogTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
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
        <TextField
          fullWidth
          value={filterName}
          onChange={onFilterName}
          placeholder="Search by user, email, or IP address..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: { sm: 320 },
            ...formInputSx,
          }}
        />

        <Button
          color="error"
          onClick={onResetFilter}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.75, sm: 1 },
          }}
        >
          Clear
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          onClick={handleOpenPopover}
          sx={{
            border: (theme) => `1px solid ${theme.palette.divider}`,
            fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
          }}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 220, p: 0 }}
      >
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

