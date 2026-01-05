import { Box, Stack, IconButton, Tooltip } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
// types
import { Editor } from '../../../../@types/editor';

// ----------------------------------------------------------------------

interface EditorFooterProps {
  editor: Editor | undefined;
}

export default function EditorFooter({ editor }: EditorFooterProps) {
  return (
    <Box
      sx={{
        height: 52,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: 2,
        gap: 0.5,
        zIndex: (theme) => theme.zIndex.appBar - 1,
      }}
    >
      <Tooltip title="Reset zoom" placement="top">
        <IconButton
          size="small"
          onClick={() => editor?.autoZoom()}
          sx={{
            height: '100%',
          }}
        >
          <Iconify icon="eva:minimize-outline" width={20} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Zoom in" placement="top">
        <IconButton
          size="small"
          onClick={() => editor?.zoomIn()}
          sx={{
            height: '100%',
          }}
        >
          <Iconify icon="eva:plus-outline" width={20} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Zoom out" placement="top">
        <IconButton
          size="small"
          onClick={() => editor?.zoomOut()}
          sx={{
            height: '100%',
          }}
        >
          <Iconify icon="eva:minus-outline" width={20} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

