import { useState } from 'react';
import { Card, Box, Typography, Stack, Chip, useTheme, alpha, IconButton, Tooltip } from '@mui/material';
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type WinePairing = {
  id?: string;
  name: string;
  type: string;
  country: string;
  flavor: string;
  profile: string;
  region: string;
  proteins: string;
  description: string;
  proteinTag: string;
};

type Props = {
  wine: WinePairing;
  canEdit?: boolean;
  onEdit?: (id: string) => void;
};

export default function WinePairingCard({ wine, canEdit = false, onEdit }: Props) {
  const theme = useTheme();
  const [showEditIcon, setShowEditIcon] = useState(false);

  return (
    <Card
      onMouseEnter={() => setShowEditIcon(true)}
      onMouseLeave={() => setShowEditIcon(false)}
      sx={{
        p: 3,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: 'none',
        bgcolor: theme.palette.background.paper,
        position: 'relative',
        transition: theme.transitions.create(['box-shadow', 'transform', 'border-color'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          boxShadow: theme.customShadows.z8,
          transform: 'translateY(-4px)',
          borderColor: canEdit ? alpha(theme.palette.primary.main, 0.24) : undefined,
          '& .edit-icon': {
            opacity: 1,
          },
        },
      }}
    >
      {canEdit && onEdit && wine.id && (
        <Tooltip title="Edit Wine Pairing" placement="top" arrow>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              console.log('🍷 [WINE PAIRING EDIT] Clicked:', { id: wine.id, wine });
              onEdit(wine.id!);
            }}
            className="edit-icon"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              opacity: 0,
              transition: theme.transitions.create('opacity', {
                duration: theme.transitions.duration.short,
              }),
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

      <Stack spacing={2.5}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a2942', mb: 0.5 }}>
              {wine.name}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
              {wine.type} • {wine.country}
            </Typography>
          </Box>

          <Chip
            label={wine.proteinTag}
            size="small"
            sx={{
              height: 28,
              borderRadius: 7,
              bgcolor: alpha(theme.palette.grey[500], 0.12),
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Details */}
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', gap: 8 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: theme.palette.text.disabled,
                  letterSpacing: 1,
                  fontSize: '0.65rem',
                }}
              >
                FLAVOR:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                {wine.flavor}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: theme.palette.text.disabled,
                  letterSpacing: 1,
                  fontSize: '0.65rem',
                }}
              >
                PROFILE:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                {wine.profile}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 8 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: theme.palette.text.disabled,
                  letterSpacing: 1,
                  fontSize: '0.65rem',
                }}
              >
                REGION:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                {wine.region}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: theme.palette.text.disabled,
                  letterSpacing: 1,
                  fontSize: '0.65rem',
                }}
              >
                PROTEINS:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                {wine.proteins}
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
            lineHeight: 1.7,
          }}
        >
          {wine.description}
        </Typography>
      </Stack>
    </Card>
  );
}

