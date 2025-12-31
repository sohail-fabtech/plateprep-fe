import { useState } from 'react';
import { Box, Typography, Chip, useTheme, alpha, IconButton, Tooltip } from '@mui/material';
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  id?: string;
  name: string;
  quantity: string;
  unit?: string;
  onEdit?: (id: string) => void;
  canEdit?: boolean;
};

export default function IngredientItem({ id, name, quantity, unit, onEdit, canEdit = false }: Props) {
  const theme = useTheme();
  const [showEditIcon, setShowEditIcon] = useState(false);

  const displayQuantity = unit ? `${quantity} ${unit}` : quantity;

  return (
    <Box
      onMouseEnter={() => setShowEditIcon(true)}
      onMouseLeave={() => setShowEditIcon(false)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: 2.5,
        py: 1.75,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.grey[500], 0.08),
        border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
        transition: theme.transitions.create(['background-color', 'transform', 'border-color'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          bgcolor: canEdit ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.grey[500], 0.12),
          borderColor: canEdit ? alpha(theme.palette.primary.main, 0.24) : 'transparent',
          '& .edit-icon': {
            opacity: 1,
          },
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: theme.palette.text.primary,
          flex: 1,
          fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
        }}
      >
        {name}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={displayQuantity}
          size="small"
          sx={{
            height: 28,
            borderRadius: 7,
            bgcolor: alpha(theme.palette.grey[500], 0.16),
            color: theme.palette.text.secondary,
            fontWeight: 600,
            fontSize: { xs: '0.6875rem', md: '0.75rem' },
            '& .MuiChip-label': {
              px: 1.5,
            },
          }}
        />

        {canEdit && onEdit && id && (
          <Tooltip title="Edit Ingredient" placement="top" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                console.log('🔧 [INGREDIENT EDIT] Clicked:', { id, name, quantity, unit });
                onEdit(id);
              }}
              className="edit-icon"
              sx={{
                opacity: 0,
                transition: theme.transitions.create('opacity', {
                  duration: theme.transitions.duration.short,
                }),
                width: { xs: 24, md: 28 },
                height: { xs: 24, md: 28 },
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Iconify icon="eva:edit-fill" width={{ xs: 16, md: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

