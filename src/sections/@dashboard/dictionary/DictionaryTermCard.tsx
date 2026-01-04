import { useState } from 'react';
// @mui
import { Card, CardContent, Stack, Typography, Divider, IconButton, useTheme, alpha, Tooltip, Button } from '@mui/material';
// @types
import { IDictionaryTerm } from '../../../@types/dictionary';
// components
import Iconify from '../../../components/iconify';
import TextMaxLine from '../../../components/text-max-line';
import ConfirmDialog from '../../../components/confirm-dialog';

// ----------------------------------------------------------------------

type Props = {
  term: IDictionaryTerm;
  onEdit?: (term: IDictionaryTerm) => void;
  onDelete?: (term: IDictionaryTerm) => void;
};

export default function DictionaryTermCard({ term, onEdit, onDelete }: Props) {
  const theme = useTheme();
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(term);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(term);
    }
    setOpenConfirm(false);
  };

  return (
    <Card
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.customShadows.z20,
          '& .show-actions': {
            opacity: 1,
          },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
          opacity: 0,
          transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.short,
          }),
          '&.show-actions': {
            opacity: 1,
          },
        }}
        className="show-actions"
      >
        {onEdit && (
          <Tooltip title="Edit Term" placement="top" arrow>
            <IconButton
              size="small"
              onClick={handleEdit}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              sx={{
                width: { xs: 28, md: 32 },
                height: { xs: 28, md: 32 },
                color: 'text.secondary',
                bgcolor: 'background.paper',
                boxShadow: theme.customShadows.z8,
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Iconify icon="eva:edit-fill" width={{ xs: 18, md: 20 }} />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete Term" placement="top" arrow>
            <IconButton
              size="small"
              onClick={handleDelete}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              sx={{
                width: { xs: 28, md: 32 },
                height: { xs: 28, md: 32 },
                color: 'text.secondary',
                bgcolor: 'background.paper',
                boxShadow: theme.customShadows.z8,
                '&:hover': {
                  color: 'error.main',
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              <Iconify icon="eva:trash-2-outline" width={{ xs: 18, md: 20 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Stack
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'primary.main',
                color: 'common.white',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="eva:bookmark-outline" width={20} />
            </Stack>
            <Stack sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {term.term}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {term.definition}
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {term.description}
          </Typography>
        </Stack>
      </CardContent>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete Term"
        content={`Are you sure you want to delete "${term.term}"? This action cannot be undone.`}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        }
      />
    </Card>
  );
}

