import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack, Button, Typography, CircularProgress } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { ITemplate } from '../../../@types/template';
// components
import Image from '../../../components/image';
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import ConfirmDialog from '../../../components/confirm-dialog';

// ----------------------------------------------------------------------

type Props = {
  template: ITemplate;
  onDelete?: VoidFunction;
  filterStatus?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  isLoading?: boolean;
};

export default function TemplateCard({ 
  template, 
  onDelete, 
  filterStatus = 'all',
  canEdit = true,
  canDelete = true,
  isLoading = false,
}: Props) {
  const theme = useTheme();
  
  const navigate = useNavigate();

  const [openConfirm, setOpenConfirm] = useState(false);
  const wasLoadingRef = useRef(false);

  // Close dialogs when loading completes
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      // Loading just completed, close dialogs
      setOpenConfirm(false);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  const { id, name, description, thumbnail, category, status, isAvailable } = template;
  
  const isArchived = filterStatus === 'archived';
  const isDeleted = !isAvailable;
  
  // In archived tab, buttons should be enabled
  const shouldDisableButtons = isDeleted && !isArchived;

  const handleEdit = () => {
    if (shouldDisableButtons) return;
    navigate(PATH_DASHBOARD.editorTemplate.edit);
  };

  const handleView = () => {
    if (shouldDisableButtons || isArchived) return;
    navigate(PATH_DASHBOARD.editorTemplate.edit);
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    if (isLoading) return;
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

          {category && (
            <Label
              variant="soft"
              color="default"
              sx={{
                bottom: { xs: 12, sm: 16 },
                left: { xs: 12, sm: 16 },
                zIndex: 9,
                position: 'absolute',
                textTransform: 'capitalize',
                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
              }}
            >
              {category}
            </Label>
          )}

          <Image
            alt={name}
            src={thumbnail}
            ratio="16/9"
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
            {name}
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
            {canEdit && !isArchived && (
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
            )}

            {canDelete && (
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
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        '&:hover': {
                          bgcolor: 'error.dark',
                          boxShadow: 'none',
                        },
                      }
                    : {
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

      {/* Archive/Delete Confirm Dialog */}
      {onDelete && (
        <ConfirmDialog
          open={openConfirm}
          onClose={handleCloseConfirm}
          title={isArchived ? "Permanent Delete" : "Archive"}
          content={
            isArchived
              ? `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`
              : `Are you sure you want to archive "${name}"?`
          }
          action={
            <Button 
              variant="contained" 
              disabled={isLoading}
              onClick={onDelete}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} sx={{ color: 'inherit' }} />
                ) : undefined
              }
              sx={{
                boxShadow: 'none',
                ...(isArchived
                  ? {
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                      '&:hover': { 
                        bgcolor: isLoading ? 'error.main' : 'error.dark',
                        boxShadow: 'none',
                      },
                    }
                  : {
                      bgcolor: theme.palette.grey[500],
                      color: '#fff',
                      '&:hover': { 
                        bgcolor: isLoading ? theme.palette.grey[500] : theme.palette.grey[600],
                        boxShadow: 'none',
                      },
                    }),
              }}
            >
              {isLoading ? (isArchived ? 'Deleting...' : 'Archiving...') : (isArchived ? 'Delete' : 'Archive')}
            </Button>
          }
          cancelButtonDisabled={isLoading}
        />
      )}
    </>
  );
}

