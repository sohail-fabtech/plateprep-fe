import { useState } from 'react';
import { Box, Typography, Chip, useTheme, alpha, IconButton, Tooltip, TextField, Stack } from '@mui/material';
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  id?: string;
  name: string;
  quantity: string;
  unit?: string;
  onSave?: (id: string, data: { name: string; quantity: string; unit?: string }) => void;
  canEdit?: boolean;
};

export default function EditableIngredientItem({ id, name, quantity, unit, onSave, canEdit = false }: Props) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editQuantity, setEditQuantity] = useState(quantity);
  const [editUnit, setEditUnit] = useState(unit || '');

  const handleSave = () => {
    if (onSave && id) {
      onSave(id, {
        name: editName,
        quantity: editQuantity,
        unit: editUnit,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(name);
    setEditQuantity(quantity);
    setEditUnit(unit || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          px: 2.5,
          py: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          border: `2px solid ${theme.palette.primary.main}`,
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ flex: 2 }}
          />
          <TextField
            size="small"
            label="Quantity"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            sx={{ width: 100 }}
          />
          {unit !== undefined && (
            <TextField
              size="small"
              label="Unit"
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value)}
              sx={{ width: 100 }}
            />
          )}
        </Stack>
        
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <IconButton
            size="small"
            onClick={handleCancel}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.12) },
            }}
          >
            <Iconify icon="eva:close-fill" width={20} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleSave}
            sx={{
              color: 'primary.main',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
            }}
          >
            <Iconify icon="eva:checkmark-fill" width={20} />
          </IconButton>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
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
            display: 'flex',
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
          label={unit ? `${quantity} ${unit}` : quantity}
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

        {canEdit && onSave && id && (
          <Tooltip title="Edit" placement="top" arrow>
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              className="edit-icon"
              sx={{
                display: 'none',
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

