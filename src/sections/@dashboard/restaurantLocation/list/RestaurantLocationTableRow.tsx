import { useState, useEffect, useRef } from 'react';
import {
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  Stack,
  Link,
  Chip,
  CircularProgress,
  useTheme,
  Button,
} from '@mui/material';
// @types
import { IRestaurantLocation } from '../../../../@types/restaurantLocation';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';

// ----------------------------------------------------------------------

type Props = {
  row: IRestaurantLocation;
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

export default function RestaurantLocationTableRow({
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
  const theme = useTheme();
  const { id, branchName, branchLocation, phoneNumber, socialMedia, isDeleted } = row;

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openArchiveConfirm, setOpenArchiveConfirm] = useState(false);
  const [openRestoreConfirm, setOpenRestoreConfirm] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const wasLoadingRef = useRef(false);

  const isArchived = isDeleted;
  const isInAllTab = filterStatus === 'all';

  // Close dialogs when loading completes
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      if (openDeleteConfirm) setOpenDeleteConfirm(false);
      if (openArchiveConfirm) setOpenArchiveConfirm(false);
      if (openRestoreConfirm) setOpenRestoreConfirm(false);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, openDeleteConfirm, openArchiveConfirm, openRestoreConfirm]);

  const handleOpenDeleteConfirm = () => {
    if (!isLoading) {
      setOpenDeleteConfirm(true);
    }
  };

  const handleCloseDeleteConfirm = () => {
    if (!isLoading) {
      setOpenDeleteConfirm(false);
    }
  };

  const handleOpenArchiveConfirm = () => {
    if (!isLoading) {
      setOpenArchiveConfirm(true);
    }
  };

  const handleCloseArchiveConfirm = () => {
    if (!isLoading) {
      setOpenArchiveConfirm(false);
    }
  };

  const handleOpenRestoreConfirm = () => {
    if (!isLoading) {
      setOpenRestoreConfirm(true);
    }
  };

  const handleCloseRestoreConfirm = () => {
    if (!isLoading) {
      setOpenRestoreConfirm(false);
    }
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

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

        {columnVisibility.branchName && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {branchName}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.branchLocation && (
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
              {branchLocation}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.phoneNumber && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {phoneNumber}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.socialLinks && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {socialMedia && socialMedia.length > 0 ? (
                <>
                  {socialMedia.slice(0, 2).map((social, index) => (
                    <Chip
                      key={index}
                      label={social.name}
                      size="small"
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      clickable
                      sx={{
                        fontSize: { xs: '0.6875rem', md: '0.75rem' },
                        height: { xs: 20, md: 24 },
                      }}
                    />
                  ))}
                  {socialMedia.length > 2 && (
                    <Chip
                      label={`+${socialMedia.length - 2}`}
                      size="small"
                      sx={{
                        fontSize: { xs: '0.6875rem', md: '0.75rem' },
                        height: { xs: 20, md: 24 },
                      }}
                    />
                  )}
                </>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.disabled',
                    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  }}
                >
                  -
                </Typography>
              )}
            </Stack>
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

        <TableCell align="right" sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <IconButton
            color={openPopover ? 'inherit' : 'default'}
            onClick={handleOpenPopover}
            disabled={isLoading || (isArchived && isInAllTab)}
            sx={{
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              opacity: isArchived && isInAllTab ? 0.5 : 1,
              cursor: isArchived && isInAllTab ? 'not-allowed' : 'pointer',
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

        {!isArchived && (
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
          <>
            {onRestoreRow && (
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
          </>
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
        title="Delete Location"
        content="Are you sure you want to delete this location permanently? This action cannot be undone."
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
        title="Archive Location"
        content={`Are you sure you want to archive "${branchName}"?`}
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
                bgcolor: theme.palette.grey[500],
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
          title="Restore Location"
          content={`Are you sure you want to restore "${branchName}"?`}
          action={
            <Button
              variant="contained"
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
                bgcolor: theme.palette.success.main,
                color: '#fff',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: theme.palette.success.dark,
                  boxShadow: 'none',
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

