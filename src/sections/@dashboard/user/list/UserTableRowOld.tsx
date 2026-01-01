import { useState } from 'react';
// @mui
import {
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';
// @types
import { IUserAccountGeneral } from '../../../../@types/user';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';

// ----------------------------------------------------------------------

type Props = {
  row: IUserAccountGeneral;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  columnVisibility: Record<string, boolean>;
};

export default function UserTableRowOld({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  columnVisibility,
}: Props) {
  const { name, avatarUrl, company, role, isVerified, status } = row;

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

        {columnVisibility.name && (
          <TableCell>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar alt={name} src={avatarUrl} />
              <Typography variant="subtitle2" noWrap>
                {name}
              </Typography>
            </Stack>
          </TableCell>
        )}

        {columnVisibility.company && (
          <TableCell align="left">{company}</TableCell>
        )}

        {columnVisibility.role && (
          <TableCell align="left">
            <Label variant="soft" color={(role === 'admin' && 'error') || 'info'}>
              {role}
            </Label>
          </TableCell>
        )}

        {columnVisibility.isVerified && (
          <TableCell align="center">
            <Iconify
              icon={isVerified ? 'eva:checkmark-circle-fill' : 'eva:clock-outline'}
              sx={{
                width: 20,
                height: 20,
                color: 'success.main',
                ...(!isVerified && { color: 'text.disabled' }),
              }}
            />
          </TableCell>
        )}

        {columnVisibility.status && (
          <TableCell align="left">
            <Label
              variant="soft"
              color={(status === 'banned' && 'error') || 'success'}
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

      <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 140 }}>
        <MenuItem
          onClick={() => {
            handleClosePopover();
            onEditRow();
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

