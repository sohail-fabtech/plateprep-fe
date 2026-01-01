import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import {
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// @types
import { ITask } from '../../../../@types/task';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import { Button } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  row: ITask;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onArchiveRow: VoidFunction;
  filterStatus: string;
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
};

export default function TaskTableRow({
  row,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onArchiveRow,
  filterStatus,
  columnVisibility,
  dense = false,
}: Props) {
  const { staffName, taskName, taskDescription, status, priority, isArchived } = row;

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

        <TableCell align="right" sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <IconButton
            color={openPopover ? 'inherit' : 'default'}
            onClick={handleOpenPopover}
            sx={{
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
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

        {filterStatus === 'archived' ? (
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
        ) : (
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
        )}
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
            onClick={() => {
              onDeleteRow();
              handleCloseDeleteConfirm();
            }}
            sx={{
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
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

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        open={openArchiveConfirm}
        onClose={handleCloseArchiveConfirm}
        title="Archive"
        content={`Are you sure you want to archive "${taskName}"?`}
        action={
          <Button
            variant="contained"
            onClick={() => {
              onArchiveRow();
              handleCloseArchiveConfirm();
            }}
            sx={{
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              bgcolor: (theme) => theme.palette.grey[500],
              color: '#fff',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: (theme) => theme.palette.grey[500],
                boxShadow: 'none',
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

