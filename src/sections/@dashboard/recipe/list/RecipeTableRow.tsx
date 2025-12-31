import { useState } from 'react';
// @mui
import {
  Stack,
  Button,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  Chip,
} from '@mui/material';
// @types
import { IRecipe } from '../../../../@types/recipe';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import { fCurrency } from '../../../../utils/formatNumber';

// ----------------------------------------------------------------------

type Props = {
  row: IRecipe;
  selected: boolean;
  onEditRow: VoidFunction;
  onViewRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  columnVisibility: Record<string, boolean>;
};

export default function RecipeTableRow({
  row,
  selected,
  onEditRow,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  columnVisibility,
}: Props) {
  const { dishName, cuisineType, station, preparationTime, foodCost, isAvailable, status } = row;

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        {columnVisibility.dishName && (
          <TableCell>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="subtitle2" noWrap>
                {dishName}
              </Typography>
            </Stack>
          </TableCell>
        )}

        {columnVisibility.cuisineType && (
          <TableCell align="left">
            <Chip label={cuisineType} size="small" variant="soft" />
          </TableCell>
        )}

        {columnVisibility.station && (
          <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
            {station}
          </TableCell>
        )}

        {columnVisibility.preparationTime && (
          <TableCell align="center">{preparationTime} min</TableCell>
        )}

        {columnVisibility.foodCost && (
          <TableCell align="right">{fCurrency(foodCost)}</TableCell>
        )}

        {columnVisibility.isAvailable && (
          <TableCell align="center">
            <Iconify
              icon={isAvailable ? 'eva:checkmark-circle-fill' : 'eva:close-circle-fill'}
              sx={{
                width: 20,
                height: 20,
                color: 'success.main',
                ...(!isAvailable && { color: 'error.main' }),
              }}
            />
          </TableCell>
        )}

        {columnVisibility.status && (
          <TableCell align="left">
            <Label
              variant="soft"
              color={
                (status === 'active' && 'success') ||
                (status === 'draft' && 'warning') ||
                'default'
              }
              sx={{ textTransform: 'capitalize' }}
            >
              {status}
            </Label>
          </TableCell>
        )}

        <TableCell align="right">
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow();
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:eye-fill" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:edit-fill" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleOpenConfirm();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Delete
        </MenuItem>
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

