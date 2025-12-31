import { useState } from 'react';
import { Box, Typography, useTheme, alpha, IconButton, Tooltip } from '@mui/material';
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  id?: string;
  text: string;
  onEdit?: (id: string) => void;
  canEdit?: boolean;
};

export default function CommentItem({ id, text, onEdit, canEdit = false }: Props) {
  const theme = useTheme();
  const [showEditIcon, setShowEditIcon] = useState(false);

  return (
    <Box
      onMouseEnter={() => setShowEditIcon(true)}
      onMouseLeave={() => setShowEditIcon(false)}
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
            opacity: 1,
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

      {canEdit && onEdit && id && (
        <Tooltip title="Edit Comment" placement="top" arrow>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              console.log('🔧 [COMMENT EDIT] Clicked:', { id, text });
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
  );
}

