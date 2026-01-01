import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import {
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  Avatar,
  Stack,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// @types
import { IUser } from '../../../../@types/user';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import { Button } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  row: IUser;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onArchiveRow: VoidFunction;
  filterStatus: string;
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
};

export default function UserTableRow({
  row,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onArchiveRow,
  filterStatus,
  columnVisibility,
  dense = false,
}: Props) {
  const { id, name, email, phoneNumber, address, location, role, avatarUrl, isDeleted } = row;

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openArchiveConfirm, setOpenArchiveConfirm] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenDeleteConfirm = () => {
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  const handleOpenArchiveConfirm = () => {
    setOpenArchiveConfirm(true);
  };

  const handleCloseArchiveConfirm = () => {
    setOpenArchiveConfirm(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const getRoleColor = (
    roleValue: string
  ): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
    switch (roleValue?.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'staff':
        return 'info';
      default:
        return 'default';
    }
  };

  // Determine if we should show Archive or Delete based on filterStatus and isDeleted
  const showArchive = filterStatus !== 'archived' && !isDeleted;
  const showDelete = filterStatus === 'archived' || isDeleted;

  return (
    <>
      <TableRow hover sx={{ ...(dense && { height: 52 }) }}>
        {columnVisibility.id && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {id}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.name && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, maxWidth: 200, ...(dense && { py: 1 }) }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                alt={name}
                src={avatarUrl}
                sx={{
                  width: { xs: 32, md: 40 },
                  height: { xs: 32, md: 40 },
                  flexShrink: 0,
                }}
              >
                {name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {name}
              </Typography>
            </Stack>
          </TableCell>
        )}

        {columnVisibility.email && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, maxWidth: 200, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email || '-'}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.phoneNumber && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, width: 150, minWidth: 150, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {phoneNumber || '-'}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.address && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, width: 300, minWidth: 300, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: dense ? 1 : 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {address || '-'}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.location && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {location || '-'}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.role && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Label color={getRoleColor(role)} sx={{ fontSize: { xs: '0.6875rem', md: '0.75rem' } }}>
              {role}
            </Label>
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
            onViewRow();
          }}
        >
          <Iconify icon="eva:eye-fill" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClosePopover();
            onEditRow();
          }}
        >
          <Iconify icon="eva:edit-fill" />
          Edit
        </MenuItem>

        {showArchive && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
              handleOpenArchiveConfirm();
            }}
            sx={{ color: 'text.secondary' }}
          >
            <Iconify icon="eva:archive-fill" />
            Archive
          </MenuItem>
        )}

        {showDelete && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
              handleOpenDeleteConfirm();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:trash-2-outline" />
            Delete
          </MenuItem>
        )}
      </MenuPopover>

      <ConfirmDialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        title="Delete User"
        content="Are you sure you want to delete this user? This action cannot be undone."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              handleCloseDeleteConfirm();
            }}
            sx={{
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                bgcolor: 'error.main',
              },
            }}
          >
            Delete
          </Button>
        }
      />

      <ConfirmDialog
        open={openArchiveConfirm}
        onClose={handleCloseArchiveConfirm}
        title="Archive User"
        content="Are you sure you want to archive this user? You can restore it later from the archived tab."
        action={
          <Button
            variant="contained"
            onClick={() => {
              onArchiveRow();
              handleCloseArchiveConfirm();
            }}
            sx={{
              bgcolor: 'grey.500',
              color: '#fff',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                bgcolor: 'grey.500',
              },
            }}
          >
            Archive
          </Button>
        }
      />
    </>
  );
}
