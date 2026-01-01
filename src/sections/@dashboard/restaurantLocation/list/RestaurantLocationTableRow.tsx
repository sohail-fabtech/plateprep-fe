import { useState } from 'react';
import {
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  Stack,
  Link,
  Chip,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// @types
import { IRestaurantLocation } from '../../../../@types/restaurantLocation';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import { Button } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  row: IRestaurantLocation;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onArchiveRow: VoidFunction;
  filterStatus: string;
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
};

export default function RestaurantLocationTableRow({
  row,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onArchiveRow,
  filterStatus,
  columnVisibility,
  dense = false,
}: Props) {
  const { id, branchName, branchLocation, phoneNumber, socialMedia } = row;

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
            </Stack>
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
        title="Delete Location"
        content="Are you sure you want to delete this location permanently? This action cannot be undone."
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
                bgcolor: 'error.main',
                boxShadow: 'none',
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
        title="Archive Location"
        content={`Are you sure you want to archive "${branchName}"?`}
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

