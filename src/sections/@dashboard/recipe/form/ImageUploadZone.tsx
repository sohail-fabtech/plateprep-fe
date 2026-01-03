import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
// @mui
import { Box, Typography, Stack, IconButton, Card, alpha, Chip, useTheme, MenuItem, MenuList, Divider } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import Image from '../../../../components/image';
import MenuPopover from '../../../../components/menu-popover';

// ----------------------------------------------------------------------

type Props = {
  images: string[];
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
  onSetPrimary: (index: number) => void;
  onSetFullyPlated: (index: number) => void;
  primaryIndex?: number;
  fullyPlatedIndex?: number;
  error?: boolean;
  helperText?: string;
};

export default function ImageUploadZone({
  images,
  onUpload,
  onRemove,
  onSetPrimary,
  onSetFullyPlated,
  primaryIndex,
  fullyPlatedIndex,
  error,
  helperText,
}: Props) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Limit to 5 images maximum
      const remainingSlots = 5 - images.length;
      const totalFiles = acceptedFiles.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      
      if (filesToAdd.length > 0) {
        onUpload(filesToAdd);
        
        // Show toast if user tried to upload more than the limit
        if (totalFiles > remainingSlots) {
          const rejected = totalFiles - remainingSlots;
          enqueueSnackbar(
            `Maximum 5 images allowed. ${filesToAdd.length} image${filesToAdd.length > 1 ? 's' : ''} added, ${rejected} rejected.`,
            { 
              variant: 'warning',
              autoHideDuration: 4000,
            }
          );
        }
      } else if (totalFiles > 0) {
        // All files rejected because limit reached
        enqueueSnackbar(
          `Maximum 5 images reached. Cannot add more images.`,
          { 
            variant: 'error',
            autoHideDuration: 3000,
          }
        );
      }
    },
    [onUpload, images.length, enqueueSnackbar]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: true,
    maxFiles: 5 - images.length,
  });

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>, index: number) => {
    event.stopPropagation();
    setOpenPopover(event.currentTarget);
    setSelectedImageIndex(index);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
    setSelectedImageIndex(null);
  };

  const handleSetPrimary = () => {
    if (selectedImageIndex !== null) {
      onSetPrimary(selectedImageIndex);
    }
    handleClosePopover();
  };

  const handleSetFullyPlated = () => {
    if (selectedImageIndex !== null) {
      onSetFullyPlated(selectedImageIndex);
    }
    handleClosePopover();
  };

  const handleRemove = () => {
    if (selectedImageIndex !== null) {
      onRemove(selectedImageIndex);
    }
    handleClosePopover();
  };

  return (
    <Box>
      {/* Upload Zone */}
      <Box
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 2,
          cursor: 'pointer',
          border: `2px dashed ${
            error
              ? theme.palette.error.main
              : isDragActive
              ? theme.palette.primary.main
              : alpha(theme.palette.grey[500], 0.32)
          }`,
          bgcolor: isDragActive
            ? alpha(theme.palette.primary.main, 0.08)
            : alpha(theme.palette.grey[500], 0.04),
          transition: theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        <input {...getInputProps()} />
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Iconify
              icon="eva:cloud-upload-outline"
              width={32}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Drop or Select Images
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Drop images here or click to{' '}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: 'primary.main', textDecoration: 'underline' }}
              >
                browse
              </Typography>{' '}
              through your files
            </Typography>
          </Box>

          <Stack spacing={0.5} alignItems="center">
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Allowed *.jpeg, *.jpg, *.png, *.webp
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'warning.main',
                fontWeight: 600,
              }}
            >
              Maximum 5 images
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {helperText && (
        <Typography variant="caption" sx={{ color: error ? 'error.main' : 'text.secondary', px: 2 }}>
          {helperText}
        </Typography>
      )}

      {images.length >= 5 && (
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={1}
          sx={{ 
            px: 2, 
            py: 1, 
            mt: 1.5,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.warning.main, 0.08),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
          }}
        >
          <Iconify 
            icon="eva:alert-triangle-fill" 
            width={20} 
            sx={{ color: 'warning.main' }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'warning.main', 
              fontWeight: 600,
              flex: 1,
            }}
          >
            Maximum 5 images reached. Remove an image to add more.
          </Typography>
        </Stack>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Uploaded Images ({images.length}/5)
          </Typography>
          
          <Box
            sx={{
              display: { xs: 'flex', md: 'grid' },
              gridTemplateColumns: { md: 'repeat(auto-fill, minmax(180px, 1fr))' },
              gap: 2,
              overflowX: { xs: 'auto', md: 'visible' },
              overflowY: 'visible',
              pb: { xs: 2, md: 0 },
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.grey[600], 0.48),
                borderRadius: 4,
              },
            }}
          >
            {images.map((image, index) => (
              <Card
                key={index}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: theme.customShadows.z8,
                  flexShrink: 0,
                  width: { xs: 120, sm: 140, md: '100%' },
                  minWidth: { xs: 120, sm: 140, md: 'auto' },
                  '&:hover .image-actions': {
                    opacity: 1,
                  },
                }}
              >
                <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                  <Image
                    src={image}
                    alt={`upload-${index}`}
                    ratio="1/1"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      width: 1,
                      height: 1,
                    }}
                  />

                  {/* Badges */}
                  <Stack
                    spacing={0.5}
                    sx={{
                      position: 'absolute',
                      top: { xs: 4, md: 8 },
                      left: { xs: 4, md: 8 },
                      zIndex: 9,
                    }}
                  >
                    {primaryIndex === index && (
                      <Chip
                        label="Primary"
                        size="small"
                        sx={{
                          height: { xs: 16, md: 20 },
                          fontSize: { xs: '0.625rem', md: '0.6875rem' },
                          fontWeight: 700,
                          bgcolor: theme.palette.primary.main,
                          color: '#fff',
                        }}
                      />
                    )}
                    {fullyPlatedIndex === index && (
                      <Chip
                        label="Fully Plated"
                        size="small"
                        sx={{
                          height: { xs: 16, md: 20 },
                          fontSize: { xs: '0.625rem', md: '0.6875rem' },
                          fontWeight: 700,
                          bgcolor: theme.palette.success.main,
                          color: '#fff',
                        }}
                      />
                    )}
                  </Stack>

                  {/* Actions - 3 dots menu on mobile, buttons on desktop */}
                  <Box
                    className="image-actions"
                    sx={{
                      position: 'absolute',
                      top: { xs: 4, md: 8 },
                      right: { xs: 4, md: 8 },
                      opacity: { xs: 1, md: 0 },
                      transition: theme.transitions.create('opacity'),
                      zIndex: 9,
                    }}
                  >
                    {/* Mobile: 3 dots menu */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenPopover(e, index)}
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: alpha(theme.palette.grey[900], 0.72),
                          color: theme.palette.common.white,
                          backdropFilter: 'blur(6px)',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.grey[900], 0.88),
                          },
                        }}
                      >
                        <Iconify icon="eva:more-vertical-fill" width={18} />
                      </IconButton>
                    </Box>

                    {/* Desktop: Action buttons */}
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => onSetPrimary(index)}
                        sx={{
                          bgcolor: alpha(theme.palette.common.white, 0.9),
                          '&:hover': {
                            bgcolor: theme.palette.common.white,
                          },
                        }}
                      >
                        <Iconify icon="eva:star-outline" width={16} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => onSetFullyPlated(index)}
                        sx={{
                          bgcolor: alpha(theme.palette.common.white, 0.9),
                          '&:hover': {
                            bgcolor: theme.palette.common.white,
                          },
                        }}
                      >
                        <Iconify icon="eva:checkmark-circle-outline" width={16} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => onRemove(index)}
                        sx={{
                          bgcolor: alpha(theme.palette.error.main, 0.9),
                          color: '#fff',
                          '&:hover': {
                            bgcolor: theme.palette.error.main,
                          },
                        }}
                      >
                        <Iconify icon="eva:trash-2-outline" width={16} />
                      </IconButton>
                    </Stack>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Popover Menu for Mobile */}
      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="top-right"
        sx={{ 
          width: 180,
          '& .MuiMenuItem-root': {
            px: 1.5,
            py: 1,
            borderRadius: 0.75,
            typography: 'body2',
            fontWeight: 500,
          },
        }}
      >
        <MenuList sx={{ p: 1 }}>
          <MenuItem 
            onClick={handleSetPrimary}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
              },
            }}
          >
            <Iconify 
              icon="eva:star-fill" 
              width={20}
              sx={{ mr: 1.5, color: 'primary.main' }}
            />
            Set Primary
          </MenuItem>

          <MenuItem 
            onClick={handleSetFullyPlated}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: alpha(theme.palette.success.main, 0.08),
                color: 'success.main',
              },
            }}
          >
            <Iconify 
              icon="eva:checkmark-circle-2-fill" 
              width={20}
              sx={{ mr: 1.5, color: 'success.main' }}
            />
            Fully Plated
          </MenuItem>

          <Box sx={{ my: 0.5, borderTop: `dashed 1px ${theme.palette.divider}` }} />

          <MenuItem 
            onClick={handleRemove}
            sx={{
              color: 'error.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            <Iconify 
              icon="eva:trash-2-fill" 
              width={20}
              sx={{ mr: 1.5 }}
            />
            Delete Image
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Box>
  );
}

