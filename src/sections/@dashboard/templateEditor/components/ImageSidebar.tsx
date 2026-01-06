import { useState } from 'react';
import { Box, Stack, Button, Grid, CircularProgress, Alert } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import ToolSidebarHeader from './ToolSidebarHeader';
import ToolSidebarClose from './ToolSidebarClose';
// types
import { ActiveTool, Editor } from '../../../../@types/editor';
// services
import { uploadFileWithPresignedUrl, generateFileKey } from '../../../../services';

// ----------------------------------------------------------------------

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

// Mock image gallery - using public placeholder images to avoid CORS issues
const MOCK_IMAGES = Array.from({ length: 12 }, (_, i) => {
  const placeholderImages = [
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504674900152-b8b80e7ddb5d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe3e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1485228857871-971b0b8e70f3?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop',
  ];

  const imageUrl = placeholderImages[i % placeholderImages.length];

  return {
    id: `mock-image-${i}`,
    url: imageUrl,
    thumbnail: imageUrl,
    name: `Image ${i + 1}`,
  };
});

export default function ImageSidebar({ editor, activeTool, onChangeActiveTool }: ImageSidebarProps) {
  const open = activeTool === 'images';
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onClose = () => {
    onChangeActiveTool('select');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const fileKey = generateFileKey('template_images', file.name);
      const s3Url = await uploadFileWithPresignedUrl(file, fileKey, file.type);
      editor?.addImage(s3Url);
      // Reset input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    editor?.addImage(imageUrl);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: open ? 360 : 0,
        height: '100%',
        bgcolor: 'background.paper',
        borderRight: (theme) => open ? `1px solid ${theme.palette.divider}` : 'none',
        zIndex: (theme) => theme.zIndex.drawer - 1,
        overflow: 'hidden',
        transition: (theme) => theme.transitions.create('width'),
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
      }}
    >
      <Stack sx={{ height: '100%', width: 360 }}>
        <ToolSidebarHeader title="Images" description="Add images to your canvas" icon="solar:gallery-bold" />

        <Box sx={{ p: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload-input"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="image-upload-input">
            <Button
              variant="outlined"
              fullWidth
              component="span"
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={16} /> : <Iconify icon="eva:upload-outline" />}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </label>
          {uploadError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {uploadError}
            </Alert>
          )}
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Grid container spacing={2}>
            {MOCK_IMAGES.map((image) => (
              <Grid item xs={6} key={image.id}>
                <Box
                  onClick={() => handleImageClick(image.url)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1',
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={image.thumbnail}
                    alt={image.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <ToolSidebarClose onClick={onClose} />
      </Stack>
    </Box>
  );
}

