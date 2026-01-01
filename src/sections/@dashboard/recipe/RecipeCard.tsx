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
  filterStatus?: string;
};

export default function RecipeCard({ recipe, onDelete, filterStatus = 'all' }: Props) {
  const theme = useTheme();
  
  const navigate = useNavigate();

  const [openConfirm, setOpenConfirm] = useState(false);

  const { id, dishName, cuisineType, imageFiles, status, isAvailable } = recipe;
  
  const isArchived = filterStatus === 'archived';

  const coverImage = imageFiles && imageFiles.length > 0 ? imageFiles[0] : '/assets/images/placeholder.jpg';

  const handleEdit = () => {
    navigate(PATH_DASHBOARD.recipes.edit(id));
  };

  const handleView = () => {
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

          <Image
            alt={dishName}
            src={coverImage}
            ratio="1/1"
            sx={{
              borderRadius: 1.5,
              cursor: 'pointer',
              transition: theme.transitions.create('opacity', {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                opacity: 0.9,
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
              cursor: 'pointer',
              transition: theme.transitions.create('color', {
                duration: theme.transitions.duration.shortest,
              }),
              '&:hover': {
                color: theme.palette.primary.main,
              },
              fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
              fontWeight: 600,
            }}
            onClick={handleView}
          >
            {dishName}
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            >
              {cuisineType}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="eva:edit-fill" width={{ xs: 16, md: 18 }} />}
              onClick={handleEdit}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                height: { xs: 36, sm: 40, md: 42 },
                fontWeight: 600,
              }}
            >
              Edit
            </Button>

            <Button
              fullWidth
              variant="contained"
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
                ...(isArchived
                  ? {
                      // Delete - Red/Error color
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                      '&:hover': {
                        bgcolor: 'error.main',
                        boxShadow: 'none',
                      },
                    }
                  : {
                      // Archive - Soft gray
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

