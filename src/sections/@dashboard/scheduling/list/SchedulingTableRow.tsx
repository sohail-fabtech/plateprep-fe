import { useState } from 'react';
// @mui
import {
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  Button,
  Divider,
} from '@mui/material';
// @types
import { IScheduling } from '../../../../@types/scheduling';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';

// ----------------------------------------------------------------------

type Props = {
  row: IScheduling;
  onDeleteRow: VoidFunction;
  onStatusUpdate: VoidFunction;
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
};

export default function SchedulingTableRow({
  row,
  onDeleteRow,
  onStatusUpdate,
  columnVisibility,
  dense = false,
}: Props) {
  const { dish, schedule_datetime, season, status, holiday, created_at } = row;

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenDeleteConfirm = () => {
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const getStatusColor = (
    statusValue: string
  ): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
    switch (statusValue?.toUpperCase()) {
      case 'APPROVED':
      case 'AP':
        return 'success';
      case 'PENDING':
      case 'PD':
        return 'warning';
      case 'CANCELLED':
      case 'CN':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <TableRow hover sx={{ ...(dense && { height: 52 }) }}>
        {columnVisibility.dishName && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {dish.name}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.scheduleDatetime && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {schedule_datetime}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.season && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {season}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.status && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Label color={getStatusColor(status.value)} sx={{ fontSize: { xs: '0.6875rem', md: '0.75rem' } }}>
              {status.name}
            </Label>
          </TableCell>
        )}

        {columnVisibility.holiday && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {holiday?.name || '-'}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.createdAt && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                color: 'text.secondary',
              }}
            >
              {created_at}
            </Typography>
          </TableCell>
        )}

        <TableCell align="right" sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 160 }}>
        <MenuItem
          onClick={() => {
            handleClosePopover();
            onStatusUpdate();
          }}
          sx={{
            fontSize: { xs: '0.8125rem', md: '0.875rem' },
            py: 1,
          }}
        >
          <Iconify icon="eva:refresh-outline" sx={{ mr: 1 }} />
          Status Update
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

        <MenuItem
          onClick={() => {
            handleClosePopover();
            handleOpenDeleteConfirm();
          }}
          sx={{
            color: 'error.main',
            fontSize: { xs: '0.8125rem', md: '0.875rem' },
            py: 1,
          }}
        >
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </MenuPopover>

      <ConfirmDialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        title="Delete"
        content="Are you sure want to delete this scheduling?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleCloseDeleteConfirm();
              onDeleteRow();
            }}
            sx={{
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

