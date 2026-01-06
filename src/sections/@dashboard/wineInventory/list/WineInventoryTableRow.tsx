import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import {
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  Chip,
  Stack,
  Divider,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// @types
import { IWineInventory } from '../../../../@types/wineInventory';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import Image from '../../../../components/image';

// ----------------------------------------------------------------------

type Props = {
  row: IWineInventory;
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

export default function WineInventoryTableRow({
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
  const {
    id,
    wineName,
    wineType,
    region,
    vintage,
    totalStock,
    stockStatus,
    tags,
    location,
    isDeleted,
    imageUrl,
  } = row;

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openArchiveConfirm, setOpenArchiveConfirm] = useState(false);
  const [openRestoreConfirm, setOpenRestoreConfirm] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const theme = useTheme();

  const handleOpenDeleteConfirm = () => {
    setOpenDeleteConfirm(true);
    handleClosePopover();
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  const handleOpenArchiveConfirm = () => {
    setOpenArchiveConfirm(true);
    handleClosePopover();
  };

  const handleCloseArchiveConfirm = () => {
    setOpenArchiveConfirm(false);
  };

  const handleOpenRestoreConfirm = () => {
    setOpenRestoreConfirm(true);
    handleClosePopover();
  };

  const handleCloseRestoreConfirm = () => {
    setOpenRestoreConfirm(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const getStockStatusColor = (
    status: string
  ): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'IN_STOCK':
        return 'success';
      case 'LOW':
        return 'warning';
      case 'OUT':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStockStatusLabel = (status: string): string => {
    switch (status) {
      case 'IN_STOCK':
        return 'In Stock';
      case 'LOW':
        return 'Low';
      case 'OUT':
        return 'Out';
      default:
        return status;
    }
  };

  const handleConfirmDelete = () => {
    onDeleteRow();
    handleCloseDeleteConfirm();
  };

  const handleConfirmArchive = () => {
    onArchiveRow();
    handleCloseArchiveConfirm();
  };

  const handleConfirmRestore = () => {
    if (onRestoreRow) {
      onRestoreRow();
    }
    handleCloseRestoreConfirm();
  };

  const isArchived = isDeleted;
  const isInAllTab = filterStatus === 'all';
  const showArchive = filterStatus !== 'archived' && !isDeleted;
  const showRestore = filterStatus === 'archived' && isDeleted && !!onRestoreRow;
  const showDelete = filterStatus === 'archived' || isDeleted;

  return (
    <>
      <TableRow hover sx={{ ...(dense && { height: 52 }) }}>
        {columnVisibility.wineName && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {imageUrl && (
                <Image
                  alt={wineName}
                  src={imageUrl}
                  sx={{
                    borderRadius: 1.5,
                    width: { xs: 40, md: 48 },
                    height: { xs: 40, md: 48 },
                    flexShrink: 0,
                    objectFit: 'cover',
                  }}
                />
              )}
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  fontWeight: 600,
                  maxWidth: { xs: 150, md: 250 },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {wineName}
              </Typography>
            </Stack>
          </TableCell>
        )}

        {columnVisibility.wineType && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                textTransform: 'capitalize',
              }}
            >
              {wineType}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.region && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                maxWidth: { xs: 150, md: 200 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {region}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.vintage && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
              }}
            >
              {vintage || '-'}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.totalStock && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                fontWeight: 600,
              }}
            >
              {totalStock}
            </Typography>
          </TableCell>
        )}

        {columnVisibility.stockStatus && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Label
              color={getStockStatusColor(stockStatus)}
              sx={{
                fontSize: { xs: '0.6875rem', md: '0.75rem' },
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {getStockStatusLabel(stockStatus)}
            </Label>
          </TableCell>
        )}

        {columnVisibility.tags && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {tags.slice(0, 2).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    fontSize: { xs: '0.6875rem', md: '0.75rem' },
                    height: { xs: 20, md: 24 },
                  }}
                />
              ))}
              {tags.length > 2 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: '0.6875rem', md: '0.75rem' },
                    color: 'text.secondary',
                  }}
                >
                  +{tags.length - 2}
                </Typography>
              )}
            </Stack>
          </TableCell>
        )}

        {columnVisibility.location && (
          <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                maxWidth: { xs: 150, md: 200 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {location}
            </Typography>
          </TableCell>
        )}

        <TableCell align="right" sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 160 }}>
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

        <Divider sx={{ borderStyle: 'dashed' }} />

        {isArchived && isInAllTab ? (
          <MenuItem onClick={handleOpenDeleteConfirm} sx={{ color: 'error.main' }}>
            <Iconify icon="eva:trash-2-outline" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        ) : isArchived ? (
          <>
            {showRestore && (
              <MenuItem
                onClick={handleOpenRestoreConfirm}
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
                onClick={handleOpenDeleteConfirm}
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
          showArchive && (
            <MenuItem
              onClick={handleOpenArchiveConfirm}
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
        open={openArchiveConfirm}
        onClose={handleCloseArchiveConfirm}
        title="Archive Wine"
        content={
          <>
            Are you sure you want to archive <strong> {wineName}</strong>? This action can be undone
            later.
          </>
        }
        action={
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirmArchive}
            startIcon={
              isLoading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : undefined
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
      />

      <ConfirmDialog
        open={openRestoreConfirm}
        onClose={handleCloseRestoreConfirm}
        title="Restore Wine"
        content={
          <>
            Are you sure you want to restore <strong>{wineName}</strong>? This will make it active
            again.
          </>
        }
        action={
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmRestore}
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : undefined
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
            {isLoading ? 'Restoring...' : 'Restore'}
          </Button>
        }
      />

      <ConfirmDialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        title="Delete Wine"
        content={
          <>
            Are you sure you want to delete <strong>{wineName}</strong>? This action cannot be
            undone.
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : undefined
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
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />
    </>
  );
}
