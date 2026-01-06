import { useState, useEffect } from 'react';
// @mui
import {
  Box,
  Toolbar,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
// types
import { ActiveTool, Editor, FONT_SIZE, FONT_WEIGHT } from '../../../../@types/editor';
// utils
import { isTextType } from '../utils';

// ----------------------------------------------------------------------

interface EditorToolbarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export default function EditorToolbar({ editor, activeTool, onChangeActiveTool }: EditorToolbarProps) {
  const theme = useTheme();
  const selectedObject = editor?.selectedObjects[0];
  const selectedObjectType = editor?.selectedObjects[0]?.type;

  const isText = isTextType(selectedObjectType);
  const isImage = selectedObjectType === 'image';

  const initialFillColor = editor?.getActiveFillColor() || '#000000';
  const initialStrokeColor = editor?.getActiveStrokeColor() || '#000000';
  const initialFontFamily = editor?.getActiveFontFamily() || 'Arial';
  const initialFontWeight = editor?.getActiveFontWeight() || FONT_WEIGHT;
  const initialFontStyle = editor?.getActiveFontStyle() || 'normal';
  const initialFontLinethrough = editor?.getActiveFontLinethrough() || false;
  const initialFontUnderline = editor?.getActiveFontUnderline() || false;
  const initialTextAlign = editor?.getActiveTextAlign() || 'left';
  const initialFontSize = editor?.getActiveFontSize() || FONT_SIZE;

  const [properties, setProperties] = useState({
    fillColor: initialFillColor,
    strokeColor: initialStrokeColor,
    fontFamily: initialFontFamily,
    fontWeight: initialFontWeight,
    fontStyle: initialFontStyle,
    fontLinethrough: initialFontLinethrough,
    fontUnderline: initialFontUnderline,
    textAlign: initialTextAlign,
    fontSize: initialFontSize,
  });

  // Update properties when selection changes
  useEffect(() => {
    if (editor && editor.selectedObjects.length > 0) {
      const currentSelected = editor.selectedObjects[0];
      setProperties({
        fillColor: editor.getActiveFillColor() || '#000000',
        strokeColor: editor.getActiveStrokeColor() || '#000000',
        fontFamily: editor.getActiveFontFamily() || 'Arial',
        fontWeight: editor.getActiveFontWeight() || FONT_WEIGHT,
        fontStyle: editor.getActiveFontStyle() || 'normal',
        fontLinethrough: editor.getActiveFontLinethrough() || false,
        fontUnderline: editor.getActiveFontUnderline() || false,
        textAlign: editor.getActiveTextAlign() || 'left',
        fontSize: editor.getActiveFontSize() || FONT_SIZE,
      });
    } else {
      // Reset to defaults when no selection
      setProperties({
        fillColor: initialFillColor,
        strokeColor: initialStrokeColor,
        fontFamily: initialFontFamily,
        fontWeight: initialFontWeight,
        fontStyle: initialFontStyle,
        fontLinethrough: initialFontLinethrough,
        fontUnderline: initialFontUnderline,
        textAlign: initialTextAlign,
        fontSize: initialFontSize,
      });
    }
  }, [editor, editor?.selectedObjects.length, editor?.canvas?.getActiveObject()]);

  const onChangeFontSize = (value: number) => {
    if (!selectedObject) return;
    editor?.changeFontSize(value);
    setProperties((current) => ({ ...current, fontSize: value }));
  };

  const onChangeTextAlign = (value: string) => {
    if (!selectedObject) return;
    editor?.changeTextAlign(value);
    setProperties((current) => ({ ...current, textAlign: value }));
  };

  const toggleBold = () => {
    if (!selectedObject) return;
    const newValue = properties.fontWeight > 500 ? 500 : 700;
    editor?.changeFontWeight(newValue);
    setProperties((current) => ({ ...current, fontWeight: newValue }));
  };

  const toggleItalic = () => {
    if (!selectedObject) return;
    const isItalic = properties.fontStyle === 'italic';
    const newValue = isItalic ? 'normal' : 'italic';
    editor?.changeFontStyle(newValue);
    setProperties((current) => ({ ...current, fontStyle: newValue }));
  };

  const toggleLinethrough = () => {
    if (!selectedObject) return;
    const newValue = !properties.fontLinethrough;
    editor?.changeFontLinethrough(newValue);
    setProperties((current) => ({ ...current, fontLinethrough: newValue }));
  };

  const toggleUnderline = () => {
    if (!selectedObject) return;
    const newValue = !properties.fontUnderline;
    editor?.changeFontUnderline(newValue);
    setProperties((current) => ({ ...current, fontUnderline: newValue }));
  };

  // Show empty toolbar if no selection
  if (!editor || editor.selectedObjects.length === 0) {
    return (
      <Box
        sx={{
          height: 56,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      />
    );
  }

  return (
    <Toolbar
      variant="dense"
      sx={{
        minHeight: '56px !important',
        height: 56,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        zIndex: (theme) => theme.zIndex.appBar - 1,
        px: 2,
        gap: 0.75,
        overflowX: 'auto',
        alignItems: 'center',
      }}
    >
      {/* Fill Color - Not for images */}
      {!isImage && (
        <Tooltip title="Fill Color">
          <IconButton
            size="small"
            onClick={() => onChangeActiveTool('fill')}
            sx={{
              bgcolor: activeTool === 'fill' ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
              color: activeTool === 'fill' ? 'primary.main' : 'text.secondary',
              borderRadius: 1,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              '&:hover': {
                bgcolor: activeTool === 'fill' ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
              },
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: 0.5,
                bgcolor: properties.fillColor,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            />
          </IconButton>
        </Tooltip>
      )}

      {/* Stroke Color - Not for text */}
      {!isText && (
        <>
          <Tooltip title="Stroke Color">
            <IconButton
              size="small"
              onClick={() => onChangeActiveTool('stroke-color')}
              sx={{
                bgcolor: activeTool === 'stroke-color' ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
                color: activeTool === 'stroke-color' ? 'primary.main' : 'text.secondary',
                borderRadius: 1,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                '&:hover': {
                  bgcolor: activeTool === 'stroke-color' ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <Iconify icon="material-symbols:stroke-partial" width={22} height={22} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Stroke Width">
            <IconButton
              size="small"
              onClick={() => onChangeActiveTool('stroke-width')}
              sx={{
                bgcolor: activeTool === 'stroke-width' ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
                color: activeTool === 'stroke-width' ? 'primary.main' : 'text.secondary',
                borderRadius: 1,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                '&:hover': {
                  bgcolor: activeTool === 'stroke-width' ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <Iconify icon="material-symbols:line-weight" width={22} height={22} />
            </IconButton>
          </Tooltip>
        </>
      )}

      {/* Text-specific controls */}
      {isText && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Font Family">
            <IconButton
              size="small"
              onClick={() => onChangeActiveTool('font')}
              sx={{
                bgcolor: activeTool === 'font' ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
                color: activeTool === 'font' ? 'primary.main' : 'text.secondary',
                borderRadius: 1,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1,
                '&:hover': {
                  bgcolor: activeTool === 'font' ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <Box component="span" sx={{ fontSize: 12, mr: 0.5, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {properties.fontFamily}
              </Box>
              <Iconify icon="eva:arrow-ios-downward-fill" width={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Bold">
            <IconButton
              size="small"
              onClick={toggleBold}
              sx={{
                bgcolor: properties.fontWeight > 500 ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
                color: properties.fontWeight > 500 ? 'primary.main' : 'text.secondary',
                borderRadius: 1,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: properties.fontWeight > 500 ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <Iconify icon="solar:text-bold-circle-bold" width={22} height={22} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Italic">
            <IconButton
              size="small"
              onClick={toggleItalic}
              sx={{
                bgcolor: properties.fontStyle === 'italic' ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
                color: properties.fontStyle === 'italic' ? 'primary.main' : 'text.secondary',
                borderRadius: 1,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: properties.fontStyle === 'italic' ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <Iconify icon="solar:text-italic-circle-bold" width={22} height={22} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Underline">
            <IconButton
              size="small"
              onClick={toggleUnderline}
              sx={{
                bgcolor: properties.fontUnderline ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
                color: properties.fontUnderline ? 'primary.main' : 'text.secondary',
                borderRadius: 1,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: properties.fontUnderline ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <Iconify icon="solar:text-underline-circle-bold" width={22} height={22} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Strikethrough">
            <IconButton
              size="small"
              onClick={toggleLinethrough}
              sx={{
                bgcolor: properties.fontLinethrough ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
                color: properties.fontLinethrough ? 'primary.main' : 'text.secondary',
                borderRadius: 1,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: properties.fontLinethrough ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <Iconify icon="solar:text-cross-circle-bold" width={22} height={22} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <ToggleButtonGroup
            value={properties.textAlign}
            exclusive
            onChange={(_, value) => value && onChangeTextAlign(value)}
            size="small"
            sx={{
              height: 36,
              border: "none",
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: 1,
                mx: 0.5,
                width: 36,
                height: 36,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: 'text.secondary',
                padding: 0,
                marginTop: 0,
                '&:first-of-type': {
                  ml: 0,
                  mt: 0,
                },
                '&:last-of-type': {
                  mr: 0,
                  mt: 0,
                },
                '&:center-of-type': {
                  mt: 0,
                },
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              },
            }}
          >
            <ToggleButton value="left" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:align-left-bold" width={22} height={22} />
            </ToggleButton>
            <ToggleButton value="center" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:align-horizontal-center-bold-duotone" width={22} height={22} />
            </ToggleButton>
            <ToggleButton value="right" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:align-right-bold" width={22} height={22} />
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            type="number"
            value={properties.fontSize}
            onChange={(e) => onChangeFontSize(Number(e.target.value))}
            size="small"
            sx={{ width: 70 }}
            inputProps={{ min: 8, max: 200, style: { textAlign: 'center' } }}
          />
        </>
      )}

      {/* Image-specific controls */}
      {isImage && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Filters">
            <IconButton
              size="small"
              onClick={() => onChangeActiveTool('filter')}
              sx={{
                bgcolor: activeTool === 'filter' ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
                color: activeTool === 'filter' ? 'primary.main' : 'text.secondary',
                borderRadius: 1,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                '&:hover': {
                  bgcolor: activeTool === 'filter' ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <Iconify icon="solar:filter-bold" width={22} height={22} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Remove Background">
            <IconButton
              size="small"
              onClick={() => onChangeActiveTool('remove-bg')}
              sx={{
                bgcolor: activeTool === 'remove-bg' ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
                color: activeTool === 'remove-bg' ? 'primary.main' : 'text.secondary',
                borderRadius: 1,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                '&:hover': {
                  bgcolor: activeTool === 'remove-bg' ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <Iconify icon="material-symbols:background-replace-rounded" width={22} height={22} />
            </IconButton>
          </Tooltip>
        </>
      )}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Common controls */}
      <Tooltip title="Bring Forward">
        <IconButton
          size="small"
          onClick={() => editor?.bringForward()}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'text.secondary',
            borderRadius: 1,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            },
          }}
        >
          <Iconify icon="solar:alt-arrow-up-bold" width={22} height={22} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Send Backward">
        <IconButton
          size="small"
          onClick={() => editor?.sendBackwards()}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'text.secondary',
            borderRadius: 1,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            },
          }}
        >
          <Iconify icon="solar:alt-arrow-down-bold" width={22} height={22} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Opacity">
        <IconButton
          size="small"
          onClick={() => onChangeActiveTool('opacity')}
          sx={{
            bgcolor: activeTool === 'opacity' ? 'action.selected' : alpha(theme.palette.primary.main, 0.08),
            color: activeTool === 'opacity' ? 'primary.main' : 'text.secondary',
            borderRadius: 1,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            '&:hover': {
              bgcolor: activeTool === 'opacity' ? 'action.selected' : alpha(theme.palette.primary.main, 0.12),
            },
          }}
        >
          <Iconify icon="material-symbols:opacity" width={22} height={22} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Duplicate">
        <IconButton
          size="small"
          onClick={() => {
            editor?.onCopy();
            editor?.onPaste();
          }}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'text.secondary',
            borderRadius: 1,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            },
          }}
        >
          <Iconify icon="solar:copy-bold" width={22} height={22} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={() => editor?.delete()}
          sx={{
            bgcolor: alpha(theme.palette.error.main, 0.08),
            color: 'error.main',
            borderRadius: 1,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.12),
            },
          }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={22} height={22} />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}

