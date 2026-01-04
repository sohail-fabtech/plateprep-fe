import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Card, CardContent, Stack, Typography, IconButton, useTheme, alpha, Tooltip, Button } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IDictionaryCategory } from '../../../@types/dictionary';
// components
import Iconify from '../../../components/iconify';
import TextMaxLine from '../../../components/text-max-line';
import ConfirmDialog from '../../../components/confirm-dialog';

// ----------------------------------------------------------------------

type Props = {
  category: IDictionaryCategory;
  onEdit?: (category: IDictionaryCategory) => void;
  onDelete?: (category: IDictionaryCategory) => void;
};

export default function DictionaryCategoryCard({ category, onEdit, onDelete }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const linkTo = PATH_DASHBOARD.dictionary.terms(category.id);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleCardClick = () => {
    navigate(linkTo);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(category);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(category);
    }
    setOpenConfirm(false);
  };

  return (
    <Card
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows.z24,
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
          <Tooltip title="Edit Category" placement="top" arrow>
            <IconButton
              size="small"
              onClick={handleEdit}
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
          <Tooltip title="Delete Category" placement="top" arrow>
            <IconButton
              size="small"
              onClick={handleDelete}
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

      <CardContent 
        onClick={handleCardClick}
        sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Stack
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: 'common.white',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="eva:book-outline" width={24} />
          </Stack>
          <Stack sx={{ flexGrow: 1 }}>
            <TextMaxLine variant="h6" line={2} persistent>
              {category.name}
            </TextMaxLine>
          </Stack>
        </Stack>

        <TextMaxLine variant="body2" sx={{ color: 'text.secondary', flexGrow: 1 }} line={3}>
          {category.description}
        </TextMaxLine>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Iconify icon="eva:arrow-forward-fill" width={16} sx={{ color: 'text.disabled' }} />
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            View Terms
          </Typography>
        </Stack>
      </CardContent>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete Category"
        content={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        }
      />
    </Card>
  );
}

