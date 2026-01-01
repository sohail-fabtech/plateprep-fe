import { useState } from 'react';
import { Box, Typography, useTheme, alpha, IconButton, Tooltip, TextField, Stack } from '@mui/material';
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  id?: string;
  text: string;
  onSave?: (id: string, data: { text: string }) => void;
  canEdit?: boolean;
};

export default function EditableCommentItem({ id, text, onSave, canEdit = false }: Props) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleSave = () => {
    if (onSave && id) {
      onSave(id, { text: editText });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
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
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          label="Comment"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
        />
        
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
        gap: 1.5,
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
            visibility: 'visible',
          },
        },
      }}
    >
      <Iconify
        icon="eva:message-circle-outline"
        width={20}
        sx={{ color: theme.palette.text.secondary }}
      />

      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          flex: 1,
          fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
        }}
      >
        {text}
      </Typography>

      {canEdit && onSave && id && (
        <Tooltip title="Edit Comment" placement="top" arrow>
          <IconButton
            size="small"
            onClick={() => setIsEditing(true)}
            className="edit-icon"
            sx={{
              visibility: 'hidden',
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
  );
}

