import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import {
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  CircularProgress,
  useTheme,
  Button,
} from '@mui/material';
// @types
import { TASK_STATUS_OPTIONS } from '../../../../@types/taskApi';
import { ITask } from '../../../../@types/task';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';

// ----------------------------------------------------------------------

type Props = {
  row: ITask;
  userId?: number;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onArchiveRow: VoidFunction;
  onRestoreRow?: VoidFunction;
  onStatusUpdate?: (statusValue: string) => void;
  filterStatus: string;
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  isLoading?: boolean;
};

export default function TaskTableRow({
  row,
  userId,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onArchiveRow,
  onRestoreRow,
  onStatusUpdate,
  filterStatus,
  columnVisibility,
  dense = false,
  canEdit = true,
  canDelete = true,
  isLoading = false,
}: Props) {
  const { staffName, taskName, taskDescription, status, priority, isArchived, staffId } = row;
  const theme = useTheme();

  // Check if task is assigned to current user
  const isAssignedToMe = userId !== undefined && staffId !== null && staffId !== undefined && userId === staffId;

  // In "All" tab, if task is deleted, disable the menu (similar to recipe card)
  const isInAllTab = filterStatus === 'all';
  const shouldDisableMenu = isArchived && isInAllTab;

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openArchiveConfirm, setOpenArchiveConfirm] = useState(false);
  const [openRestoreConfirm, setOpenRestoreConfirm] = useState(false);
  const [openStatusUpdatePopover, setOpenStatusUpdatePopover] = useState<HTMLElement | null>(null);
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

  const handleOpenStatusUpdatePopover = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setOpenStatusUpdatePopover(event.currentTarget);
  };

  const handleCloseStatusUpdatePopover = () => {
    setOpenStatusUpdatePopover(null);
  };

  const handleStatusUpdate = (statusValue: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(statusValue);
    }
    handleCloseStatusUpdatePopover();
    handleClosePopover();
  };

  const getStatusColor = (
    statusValue: string
  ): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
    switch (statusValue) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (
    priorityValue: string
  ): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
    switch (priorityValue) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      <TableRow hover sx={{ ...(dense && { height: 52 }) }}>
        {columnVisibility.staffName && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {staffName}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.taskName && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {taskName}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.taskDescription && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, maxWidth: 300, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: dense ? 1 : 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {taskDescription}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.status && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Label
              variant="soft"
              color={getStatusColor(status)}
              sx={{
                textTransform: 'capitalize',
                fontSize: { xs: '0.6875rem', md: '0.75rem' },
                fontWeight: 600,
              }}
            >
              {status}
            </Label>
          </TableCell>
        )}

        {columnVisibility.priority && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Label
              variant="soft"
              color={getPriorityColor(priority)}
              sx={{
                textTransform: 'capitalize',
                fontSize: { xs: '0.6875rem', md: '0.75rem' },
                fontWeight: 600,
              }}
            >
              {priority}
            </Label>
          </TableCell>
        )}

        {columnVisibility.archiveStatus && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
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

        {columnVisibility.assignedToMe && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            {isAssignedToMe ? (
              <Label
                variant="soft"
                color="info"
                sx={{
                  textTransform: 'capitalize',
                  fontSize: { xs: '0.6875rem', md: '0.75rem' },
                  fontWeight: 600,
                }}
              >
                Yes
              </Label>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.disabled',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                }}
              >
                No
              </Typography>
            )}
          </TableCell>
        )}

        <TableCell align="right" sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <IconButton
            color={openPopover ? 'inherit' : 'default'}
            onClick={handleOpenPopover}
            disabled={shouldDisableMenu}
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
          sx={{
            fontSize: { xs: '0.8125rem', md: '0.875rem' },
            py: 1,
          }}
        >
          <Iconify icon="eva:eye-fill" sx={{ mr: 1 }} />
          View
        </MenuItem>

        {/* If assigned to current user, show Status Update instead of Edit/Delete */}
        {isAssignedToMe && !isArchived && onStatusUpdate ? (
          <MenuItem
            onClick={handleOpenStatusUpdatePopover}
            sx={{
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              py: 1,
            }}
          >
            <Iconify icon="eva:edit-2-fill" sx={{ mr: 1 }} />
            Status Update
          </MenuItem>
        ) : (
          <>
            {!isArchived && canEdit && !isAssignedToMe && (
              <MenuItem
                onClick={() => {
                  onEditRow();
                  handleClosePopover();
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
          </>
        )}

        {/* In "All" tab, if task is deleted, show Delete instead of Archive */}
        {isArchived && isInAllTab ? (
          canDelete && (
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
          )
        ) : isArchived ? (
          // In "archived" tab, show Restore and Delete
          <>
            {onRestoreRow && (
              <MenuItem
                onClick={() => {
                  handleOpenRestoreConfirm();
                  handleClosePopover();
                }}
                sx={{
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  py: 1,
                }}
              >
                <Iconify icon="eva:refresh-fill" sx={{ mr: 1 }} />
                Restore
              </MenuItem>
            )}
            {canDelete && (
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
          // Not archived, show Archive (only if not assigned to current user)
          canDelete && !isAssignedToMe && (
            <MenuItem
              onClick={() => {
                handleOpenArchiveConfirm();
                handleClosePopover();
              }}
              sx={{
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

      {/* Status Update Submenu */}
      <MenuPopover
        open={openStatusUpdatePopover}
        onClose={handleCloseStatusUpdatePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ width: 200 }}
      >
        {TASK_STATUS_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleStatusUpdate(option.value)}
            selected={status === option.value}
            sx={{
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              py: 1,
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuPopover>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        title="Delete"
        content="Are you sure want to delete?"
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

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        open={openArchiveConfirm}
        onClose={handleCloseArchiveConfirm}
        title="Archive"
        content={`Are you sure you want to archive "${taskName}"?`}
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

      {/* Restore Confirmation Dialog */}
      {onRestoreRow && (
        <ConfirmDialog
          open={openRestoreConfirm}
          onClose={handleCloseRestoreConfirm}
          title="Restore"
          content={`Are you sure you want to restore "${taskName}"?`}
          action={
            <Button
              variant="contained"
              color="success"
              disabled={isLoading}
              onClick={() => {
                onRestoreRow();
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
      )}
    </>
  );
}

