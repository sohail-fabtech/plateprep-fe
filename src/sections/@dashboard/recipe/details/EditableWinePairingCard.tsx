import { useState } from 'react';
import { Card, Box, Typography, Stack, Chip, useTheme, alpha, IconButton, Tooltip, TextField, Grid } from '@mui/material';
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
  onSave?: (id: string, data: {
    name: string;
    type: string;
    flavor: string;
    profile: string;
    description: string;
    proteins: string;
    region: string;
  }) => void;
};

export default function EditableWinePairingCard({ wine, canEdit = false, onSave }: Props) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(wine.name);
  const [editType, setEditType] = useState(wine.type);
  const [editFlavor, setEditFlavor] = useState(wine.flavor);
  const [editProfile, setEditProfile] = useState(wine.profile);
  const [editDescription, setEditDescription] = useState(wine.description);
  const [editProteins, setEditProteins] = useState(wine.proteins);
  const [editRegion, setEditRegion] = useState(wine.region);

  const handleSave = () => {
    if (onSave && wine.id) {
      onSave(wine.id, {
        name: editName,
        type: editType,
        flavor: editFlavor,
        profile: editProfile,
        description: editDescription,
        proteins: editProteins,
        region: editRegion,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(wine.name);
    setEditType(wine.type);
    setEditFlavor(wine.flavor);
    setEditProfile(wine.profile);
    setEditDescription(wine.description);
    setEditProteins(wine.proteins);
    setEditRegion(wine.region);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          border: `2px solid ${theme.palette.primary.main}`,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          boxShadow: theme.customShadows.z16,
        }}
      >
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                size="small"
                label="Wine Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Protein"
                value={editProteins}
                onChange={(e) => setEditProteins(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Wine Type"
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Region"
                value={editRegion}
                onChange={(e) => setEditRegion(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Flavor"
                value={editFlavor}
                onChange={(e) => setEditFlavor(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Profile"
                value={editProfile}
                onChange={(e) => setEditProfile(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Pairing Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </Grid>
          </Grid>

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
        </Stack>
      </Card>
    );
  }

  return (
    <Card
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
            visibility: 'visible',
          },
        },
      }}
    >
      {canEdit && onSave && wine.id && (
        <Tooltip title="Edit Wine Pairing" placement="top" arrow>
          <IconButton
            size="small"
            onClick={() => setIsEditing(true)}
            className="edit-icon"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              visibility: 'hidden',
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

          {/* Description */}
          <Box
            sx={{
              pt: 1.5,
              borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            }}
          >
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
              PAIRING NOTES:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: theme.palette.text.secondary,
                lineHeight: 1.7,
              }}
            >
              {wine.description}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}

