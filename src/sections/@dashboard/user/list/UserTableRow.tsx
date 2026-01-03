import { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  useTheme,
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
import { defaultTableCellStyles } from '../../../../components/table';
// utils
import { truncateText } from '../../../../utils/truncateText';

// ----------------------------------------------------------------------

type Props = {
  row: IUser;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onArchiveRow: VoidFunction;
  onRestoreRow?: VoidFunction;
  filterStatus: string;
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
  isLoading?: boolean;
};

export default function UserTableRow({
  row,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onArchiveRow,
  onRestoreRow,
  filterStatus,
  columnVisibility,
  dense = false,
  isLoading = false,
}: Props) {
  const { id, name, email, phoneNumber, address, location, role, avatarUrl, isDeleted } = row;
  const theme = useTheme();

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openArchiveConfirm, setOpenArchiveConfirm] = useState(false);
  const [openRestoreConfirm, setOpenRestoreConfirm] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const wasLoadingRef = useRef(false);

  // Close dialogs when loading completes
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      // Loading just completed, close dialogs
      setOpenDeleteConfirm(false);
      setOpenArchiveConfirm(false);
      setOpenRestoreConfirm(false);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  const handleOpenDeleteConfirm = () => {
    if (isLoading) return; // Prevent opening dialog during loading
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    if (isLoading) return; // Prevent closing dialog during loading
    setOpenDeleteConfirm(false);
  };

  const handleOpenArchiveConfirm = () => {
    if (isLoading) return; // Prevent opening dialog during loading
    setOpenArchiveConfirm(true);
  };

  const handleCloseArchiveConfirm = () => {
    if (isLoading) return; // Prevent closing dialog during loading
    setOpenArchiveConfirm(false);
  };

  const handleOpenRestoreConfirm = () => {
    if (isLoading) return; // Prevent opening dialog during loading
    setOpenRestoreConfirm(true);
  };

  const handleCloseRestoreConfirm = () => {
    if (isLoading) return; // Prevent closing dialog during loading
    setOpenRestoreConfirm(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    if (shouldDisableMenu) return; // Prevent opening menu if deleted in "All" tab
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

  // Determine if we should show Archive, Restore, or Delete based on filterStatus and isDeleted
  const isArchived = isDeleted === true;
  const showArchive = filterStatus !== 'archived' && !isArchived;
  const showRestore = filterStatus === 'archived' && isArchived && onRestoreRow;
  const showDelete = filterStatus === 'archived' && isArchived;

  // In "All" tab, if user is deleted, disable the menu (similar to task table)
  const isInAllTab = filterStatus === 'all';
  const shouldDisableMenu = isArchived && isInAllTab;

  return (
    <>
      <TableRow hover sx={{ ...(dense && { height: 52 }) }}>
        {columnVisibility.id && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }), ...defaultTableCellStyles }}>
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
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, maxWidth: 200, ...(dense && { py: 1 }), ...defaultTableCellStyles }}>
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
                title={name || ''}
              >
                {truncateText(name, 30)}
              </Typography>
            </Stack>
          </TableCell>
        )}

        {columnVisibility.email && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, maxWidth: 200, ...(dense && { py: 1 }), ...defaultTableCellStyles }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={email || ''}
            >
              {email ? truncateText(email, 30) : '-'}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.phoneNumber && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, width: 150, minWidth: 150, ...(dense && { py: 1 }), ...defaultTableCellStyles }}>
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
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, width: 300, minWidth: 300, ...(dense && { py: 1 }), ...defaultTableCellStyles }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={address || ''}
            >
              {address ? truncateText(address, 40) : '-'}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.location && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }), ...defaultTableCellStyles }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={location || ''}
            >
              {location ? truncateText(location, 30) : '-'}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.role && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }), ...defaultTableCellStyles }}>
            <Label color={getRoleColor(role)} sx={{ fontSize: { xs: '0.6875rem', md: '0.75rem' } }}>
              {role}
            </Label>
          </TableCell>
        )}

        {columnVisibility.archiveStatus && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }), ...defaultTableCellStyles }}>
            <Label
              variant="soft"
              color={isArchived ? 'error' : 'success'}
              sx={{
                textTransform: 'capitalize',
                fontSize: { xs: '0.6875rem', md: '0.75rem' },
                fontWeight: 600,
              }}
            >
              {isArchived ? 'Archived' : 'Active'}
            </Label>
          </TableCell>
        )}

        <TableCell align="right" sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }), ...defaultTableCellStyles }}>
          <IconButton
            onClick={handleOpenPopover}
            disabled={isLoading || shouldDisableMenu}
            sx={{
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              opacity: shouldDisableMenu ? 0.5 : 1,
              cursor: shouldDisableMenu ? 'not-allowed' : 'pointer',
            }}
          >
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
          sx={{
            fontSize: { xs: '0.8125rem', md: '0.875rem' },
            py: 1,
          }}
        >
          <Iconify icon="eva:eye-fill" sx={{ mr: 1 }} />
          View
        </MenuItem>

        {!isArchived && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onEditRow();
            }}
            sx={{
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              py: 1,
            }}
          >
            <Iconify icon="eva:edit-fill" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}

        {/* In "All" tab, if user is deleted, show Delete instead of Archive */}
        {isArchived && isInAllTab ? (
          <MenuItem
            onClick={() => {
              handleOpenDeleteConfirm();
              handleClosePopover();
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
        ) : isArchived ? (
          // In "archived" tab, show Restore and Delete
          <>
            {showRestore && (
              <MenuItem
                onClick={() => {
                  handleOpenRestoreConfirm();
                  handleClosePopover();
                }}
                sx={{
                  color: 'success.main',
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  py: 1,
                }}
              >
                <Iconify icon="eva:refresh-fill" sx={{ mr: 1 }} />
                Restore
              </MenuItem>
            )}

            {showDelete && (
              <MenuItem
                onClick={() => {
                  handleOpenDeleteConfirm();
                  handleClosePopover();
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
            )}
          </>
        ) : (
          // In "active" or "all" tab for active users, show Archive
          showArchive && (
            <MenuItem
              onClick={() => {
                handleOpenArchiveConfirm();
                handleClosePopover();
              }}
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                py: 1,
              }}
            >
              <Iconify icon="eva:archive-fill" sx={{ mr: 1 }} />
              Archive
            </MenuItem>
          )
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
            disabled={isLoading}
            onClick={() => {
              onDeleteRow();
            }}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : undefined
            }
            sx={{
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                bgcolor: isLoading ? 'error.main' : 'error.dark',
              },
            }}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        }
        cancelButtonDisabled={isLoading}
      />

      <ConfirmDialog
        open={openArchiveConfirm}
        onClose={handleCloseArchiveConfirm}
        title="Archive User"
        content="Are you sure you want to archive this user? You can restore it later from the archived tab."
        action={
          <Button
            variant="contained"
            disabled={isLoading}
            onClick={() => {
              onArchiveRow();
            }}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : undefined
            }
            sx={{
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              bgcolor: theme.palette.grey[500],
              color: '#fff',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: isLoading ? theme.palette.grey[500] : theme.palette.grey[600],
                boxShadow: 'none',
              },
            }}
          >
            {isLoading ? 'Archiving...' : 'Archive'}
          </Button>
        }
        cancelButtonDisabled={isLoading}
      />

      <ConfirmDialog
        open={openRestoreConfirm}
        onClose={handleCloseRestoreConfirm}
        title="Restore User"
        content="Are you sure you want to restore this user? The user will be moved back to the active list."
        action={
          <Button
            variant="contained"
            color="success"
            disabled={isLoading}
            onClick={() => {
              if (onRestoreRow) {
                onRestoreRow();
              }
            }}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : undefined
            }
            sx={{
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                bgcolor: isLoading ? 'success.main' : 'success.dark',
              },
            }}
          >
            {isLoading ? 'Restoring...' : 'Restore'}
          </Button>
        }
        cancelButtonDisabled={isLoading}
      />
    </>
  );
}
