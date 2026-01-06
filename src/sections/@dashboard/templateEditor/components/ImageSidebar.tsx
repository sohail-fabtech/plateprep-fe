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

// Mock image gallery - using S3 URLs
const MOCK_IMAGES = Array.from({ length: 12 }, (_, i) => ({
  id: `mock-image-${i}`,
  url: 'https://plateprep-be.s3.amazonaws.com/Garden_Breeze_2.png',
  thumbnail: 'https://plateprep-be.s3.amazonaws.com/Garden_Breeze_2.png',
  name: `Image ${i + 1}`,
}));

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

