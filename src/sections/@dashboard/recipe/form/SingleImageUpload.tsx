import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
// @mui
import { Box, Typography, Stack, IconButton, Card, alpha, useTheme, MenuItem, MenuList } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import Image from '../../../../components/image';
import MenuPopover from '../../../../components/menu-popover';

// ----------------------------------------------------------------------

type Props = {
  image: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  label?: string;
  error?: boolean;
  helperText?: string;
};

export default function SingleImageUpload({
  image,
  onUpload,
  onRemove,
  label = 'Upload Image',
  error,
  helperText,
}: Props) {
  const theme = useTheme();
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
          onUpload(file);
        }
      },
      [onUpload]
    ),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: false, // Only one image allowed
  });

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleRemove = () => {
    onRemove();
    handleClosePopover();
  };

  return (
    <Box>
      {image ? (
        <Box sx={{ mt: 3, maxWidth: { xs: 140, sm: 180, md: 240 } }}>
          <Card
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: theme.customShadows.z8,
              '&:hover .image-actions': {
                opacity: 1,
              },
            }}
          >
            <Box sx={{ position: 'relative', paddingTop: '100%' }}>
              <Image
                src={image}
                alt="uploaded"
                ratio="1/1"
                sx={{
                  position: 'absolute',
                  top: 0,
                  width: 1,
                  height: 1,
                }}
              />

              {/* Actions - 3 dots menu on mobile, button on desktop */}
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
                    onClick={handleOpenPopover}
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

                {/* Desktop: Delete button */}
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  <IconButton
                    size="small"
                    onClick={onRemove}
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
        </Box>
      ) : (
        <Box
          {...getRootProps()}
          sx={{
            p: { xs: 2, md: 3 },
            mt: 3,
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
          <Stack spacing={{ xs: 1, md: 2 }} alignItems="center" justifyContent="center">
            <Box
              sx={{
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <Iconify
                icon="eva:image-outline"
                width={{ xs: 20, md: 24 }}
                sx={{ color: theme.palette.primary.main }}
              />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                {isDragActive ? 'Drop image here' : label}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                Drop image here or click to{' '}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: 'primary.main', textDecoration: 'underline' }}
                >
                  browse
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      {helperText && (
        <Typography variant="caption" sx={{ color: error ? 'error.main' : 'text.secondary', px: 2, mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {/* Popover Menu for Mobile */}
      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="top-right"
        sx={{ 
          width: 160,
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
