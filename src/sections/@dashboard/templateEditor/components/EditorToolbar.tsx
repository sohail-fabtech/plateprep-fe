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
        gap: 1,
        overflowX: 'auto',
      }}
    >
      {/* Fill Color - Not for images */}
      {!isImage && (
        <Tooltip title="Fill Color">
          <IconButton
            size="small"
            onClick={() => onChangeActiveTool('fill')}
            sx={{
              bgcolor: activeTool === 'fill' ? 'action.selected' : 'transparent',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              width: 32,
              height: 32,
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
                bgcolor: activeTool === 'stroke-color' ? 'action.selected' : 'transparent',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                width: 32,
                height: 32,
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 0.5,
                  border: (theme) => `2px solid ${properties.strokeColor}`,
                  bgcolor: 'background.paper',
                }}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Stroke Width">
            <IconButton
              size="small"
              onClick={() => onChangeActiveTool('stroke-width')}
              sx={{
                bgcolor: activeTool === 'stroke-width' ? 'action.selected' : 'transparent',
              }}
            >
              <Iconify icon="solar:line-width-bold" width={20} />
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
                bgcolor: activeTool === 'font' ? 'action.selected' : 'transparent',
                minWidth: 100,
                textTransform: 'none',
              }}
            >
              <Box component="span" sx={{ fontSize: 12, mr: 0.5, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                bgcolor: properties.fontWeight > 500 ? 'action.selected' : 'transparent',
              }}
            >
              <Iconify icon="solar:bold-bold" width={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Italic">
            <IconButton
              size="small"
              onClick={toggleItalic}
              sx={{
                bgcolor: properties.fontStyle === 'italic' ? 'action.selected' : 'transparent',
              }}
            >
              <Iconify icon="solar:italic-bold" width={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Underline">
            <IconButton
              size="small"
              onClick={toggleUnderline}
              sx={{
                bgcolor: properties.fontUnderline ? 'action.selected' : 'transparent',
              }}
            >
              <Iconify icon="solar:underline-bold" width={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Strikethrough">
            <IconButton
              size="small"
              onClick={toggleLinethrough}
              sx={{
                bgcolor: properties.fontLinethrough ? 'action.selected' : 'transparent',
              }}
            >
              <Iconify icon="solar:strikethrough-bold" width={20} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <ToggleButtonGroup
            value={properties.textAlign}
            exclusive
            onChange={(_, value) => value && onChangeTextAlign(value)}
            size="small"
            sx={{ height: 32 }}
          >
            <ToggleButton value="left">
              <Iconify icon="solar:align-left-bold" width={18} />
            </ToggleButton>
            <ToggleButton value="center">
              <Iconify icon="solar:align-center-bold" width={18} />
            </ToggleButton>
            <ToggleButton value="right">
              <Iconify icon="solar:align-right-bold" width={18} />
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
                bgcolor: activeTool === 'filter' ? 'action.selected' : 'transparent',
              }}
            >
              <Iconify icon="solar:filter-bold" width={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Remove Background">
            <IconButton
              size="small"
              onClick={() => onChangeActiveTool('remove-bg')}
              sx={{
                bgcolor: activeTool === 'remove-bg' ? 'action.selected' : 'transparent',
              }}
            >
              <Iconify icon="solar:layers-split-bold" width={20} />
            </IconButton>
          </Tooltip>
        </>
      )}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Common controls */}
      <Tooltip title="Bring Forward">
        <IconButton size="small" onClick={() => editor?.bringForward()}>
          <Iconify icon="solar:alt-arrow-up-bold" width={20} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Send Backward">
        <IconButton size="small" onClick={() => editor?.sendBackwards()}>
          <Iconify icon="solar:alt-arrow-down-bold" width={20} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Opacity">
        <IconButton
          size="small"
          onClick={() => onChangeActiveTool('opacity')}
          sx={{
            bgcolor: activeTool === 'opacity' ? 'action.selected' : 'transparent',
          }}
        >
          <Iconify icon="solar:transparency-bold" width={20} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Duplicate">
        <IconButton
          size="small"
          onClick={() => {
            editor?.onCopy();
            editor?.onPaste();
          }}
        >
          <Iconify icon="solar:copy-bold" width={20} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton size="small" onClick={() => editor?.delete()} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" width={20} />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}

