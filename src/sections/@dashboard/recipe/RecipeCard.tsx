import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack, Button, Typography } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { IRecipe } from '../../../@types/recipe';
// components
import Image from '../../../components/image';
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import ConfirmDialog from '../../../components/confirm-dialog';

// ----------------------------------------------------------------------

type Props = {
  recipe: IRecipe;
  onDelete: VoidFunction;
  onRecover?: VoidFunction;
  filterStatus?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canArchive?: boolean;
};

export default function RecipeCard({ 
  recipe, 
  onDelete, 
  onRecover, 
  filterStatus = 'all',
  canEdit = true,
  canDelete = true,
  canArchive = true,
}: Props) {
  const theme = useTheme();
  
  const navigate = useNavigate();

  const [openConfirm, setOpenConfirm] = useState(false);

  const { id, dishName, cuisineType, description, imageFiles, status, isAvailable } = recipe;
  
  const isArchived = filterStatus === 'archived';
  const isDeleted = !isAvailable; // isAvailable is false when is_deleted is true
  
  // In archived tab, buttons should be enabled
  const shouldDisableButtons = isDeleted && !isArchived;

  const coverImage = imageFiles && imageFiles.length > 0 ? imageFiles[0] : '/assets/images/placeholder.jpg';

  const handleEdit = () => {
    if (shouldDisableButtons) return; // Prevent navigation if deleted (and not in archived tab)
    navigate(PATH_DASHBOARD.recipes.edit(id));
  };

  const handleRecover = () => {
    if (onRecover) {
      onRecover();
    }
  };

  const handleView = () => {
    if (shouldDisableButtons || isArchived) return; // Prevent navigation if deleted or archived
    navigate(PATH_DASHBOARD.recipes.view(id));
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  return (
    <>
      <Card
        sx={{
          position: 'relative',
          boxShadow: theme.customShadows.z8,
          transition: theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            boxShadow: theme.customShadows.z20,
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box sx={{ position: 'relative', p: { xs: 0.75, sm: 1 } }}>
          {!isAvailable && (
            <Label
              variant="filled"
              color="error"
              sx={{
                top: { xs: 12, sm: 16 },
                right: { xs: 12, sm: 16 },
                zIndex: 9,
                position: 'absolute',
                textTransform: 'uppercase',
                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
              }}
            >
              Unavailable
            </Label>
          )}

          {status && (
            <Label
              variant="soft"
              color={
                (status === 'active' && 'success') ||
                (status === 'draft' && 'warning') ||
                (status === 'private' && 'info') ||
                (status === 'archived' && 'error') ||
                'default'
              }
              sx={{
                top: { xs: 12, sm: 16 },
                left: { xs: 12, sm: 16 },
                zIndex: 9,
                position: 'absolute',
                textTransform: 'capitalize',
                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
              }}
            >
              {status}
            </Label>
          )}

          {cuisineType && cuisineType !== 'N/A' && (
            <Label
              variant="soft"
              color="default"
              sx={{
                bottom: { xs: 12, sm: 16 }, // Position below status label (12px + 24px label height + 8px gap)
                left: { xs: 12, sm: 16 },
                zIndex: 9,
                position: 'absolute',
                textTransform: 'capitalize',
                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
              }}
            >
              {cuisineType}
            </Label>
          )}

          <Image
            alt={dishName}
            src={coverImage}
            ratio="1/1"
            sx={{
              borderRadius: 1.5,
              cursor: shouldDisableButtons || isArchived ? 'not-allowed' : 'pointer',
              opacity: shouldDisableButtons || isArchived ? 0.6 : 1,
              transition: theme.transitions.create('opacity', {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                opacity: shouldDisableButtons || isArchived ? 0.6 : 0.9,
              },
            }}
            onClick={handleView}
          />
        </Box>

        <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              cursor: shouldDisableButtons || isArchived ? 'not-allowed' : 'pointer',
              opacity: shouldDisableButtons || isArchived ? 0.6 : 1,
              transition: theme.transitions.create('color', {
                duration: theme.transitions.duration.shortest,
              }),
              '&:hover': {
                color: shouldDisableButtons || isArchived ? 'inherit' : theme.palette.primary.main,
              },
              fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
              fontWeight: 600,
            }}
            onClick={handleView}
          >
            {dishName}
          </Typography>

          {description && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.5,
                minHeight: { xs: '2.5rem', sm: '2.75rem' },
              }}
            >
              {description}
            </Typography>
          )}

          <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }}>
            {isArchived ? (
              // Recover button for archived tab
              canEdit && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  startIcon={<Iconify icon="eva:refresh-fill" width={{ xs: 16, md: 18 }} />}
                  onClick={handleRecover}
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    height: { xs: 36, sm: 40, md: 42 },
                    fontWeight: 600,
                  }}
                >
                  Recover
                </Button>
              )
            ) : (
              // Edit button for other tabs
              canEdit && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  disabled={shouldDisableButtons}
                  startIcon={<Iconify icon="eva:edit-fill" width={{ xs: 16, md: 18 }} />}
                  onClick={handleEdit}
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    height: { xs: 36, sm: 40, md: 42 },
                    fontWeight: 600,
                    cursor: shouldDisableButtons ? 'not-allowed' : 'pointer',
                  }}
                >
                  Edit
                </Button>
              )
            )}

            {(isArchived ? canDelete : canArchive) && (
              <Button
                fullWidth
                variant="contained"
                disabled={shouldDisableButtons}
                onClick={handleOpenConfirm}
                startIcon={
                  <Iconify 
                    icon={isArchived ? "eva:trash-2-outline" : "eva:archive-fill"} 
                    width={{ xs: 16, md: 18 }} 
                  />
                }
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                  height: { xs: 36, sm: 40, md: 42 },
                  fontWeight: 600,
                  boxShadow: 'none',
                  cursor: shouldDisableButtons ? 'not-allowed' : 'pointer',
                  ...(isArchived
                    ? {
                        // Delete - Red/Error color
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        '&:hover': {
                          bgcolor: 'error.dark',
                          boxShadow: 'none',
                        },
                      }
                    : {
                        // Archive - Soft gray
                        bgcolor: theme.palette.grey[500],
                        color: '#fff',
                        '&:hover': {
                          bgcolor: theme.palette.grey[600],
                          boxShadow: 'none',
                        },
                      }),
                }}
              >
                {isArchived ? 'Delete' : 'Archive'}
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title={isArchived ? "Delete" : "Archive"}
        content={
          isArchived
            ? "Are you sure want to delete?"
            : `Are you sure you want to archive "${dishName}"?`
        }
        action={
          <Button 
            variant="contained" 
            onClick={onDelete}
            sx={{
              boxShadow: 'none',
              ...(isArchived
                ? {
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    '&:hover': { 
                      bgcolor: 'error.main',
                      boxShadow: 'none',
                    },
                  }
                : {
                    bgcolor: theme.palette.grey[500],
                    color: '#fff',
                    '&:hover': { 
                      bgcolor: theme.palette.grey[500],
                      boxShadow: 'none',
                    },
                  }),
            }}
          >
            {isArchived ? 'Delete' : 'Archive'}
          </Button>
        }
      />
    </>
  );
}

