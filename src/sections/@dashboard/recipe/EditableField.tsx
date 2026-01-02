import { useState } from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import {
  Box,
  Stack,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Chip,
  Typography,
  Autocomplete,
  SelectChangeEvent,
  Tooltip,
  Fade,
} from '@mui/material';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

type EditableFieldProps = {
  label: string;
  value: string | number | string[];
  type?: 'text' | 'number' | 'select' | 'multiline' | 'tags';
  options?: string[];
  canEdit?: boolean;
  isEditing?: boolean;
  onEdit?: VoidFunction;
  onSave?: (newValue: string | number | string[]) => void;
  onCancel?: VoidFunction;
  placeholder?: string;
  unit?: string;
};

export default function EditableField({
  label,
  value,
  type = 'text',
  options = [],
  canEdit = true,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  placeholder,
  unit,
}: EditableFieldProps) {
  const theme = useTheme();
  
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (onSave) {
      onSave(editValue);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    if (onCancel) {
      onCancel();
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    setEditValue(event.target.value);
  };

  const handleTagsChange = (event: React.SyntheticEvent, newValue: string[]) => {
    setEditValue(newValue);
  };

  // View Mode
  if (!isEditing) {
    return (
      <Box
        sx={{
          py: 1.5,
          px: 2,
          borderRadius: 1.5,
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          position: 'relative',
          transition: theme.transitions.create(['border-color', 'background-color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            borderColor: canEdit ? alpha(theme.palette.primary.main, 0.24) : 'transparent',
            bgcolor: canEdit ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
            '& .edit-icon': {
              visibility: 'visible',
            },
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Typography>
          {canEdit && (
            <Tooltip title={`Edit ${label}`} placement="top" arrow>
              <IconButton
                size="small"
                onClick={onEdit}
                className="edit-icon"
                sx={{
                  width: 28,
                  height: 28,
                  color: 'text.secondary',
                  visibility: 'hidden',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Iconify icon="eva:edit-fill" width={18} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        
        {type === 'tags' && Array.isArray(value) ? (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1, gap: 0.5 }}>
            {value.length > 0 ? (
              value.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    height: 24,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.75rem',
                    },
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.disabled" fontStyle="italic">
                No tags
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: value ? 'text.primary' : 'text.disabled',
              fontWeight: value ? 500 : 400,
              fontStyle: value ? 'normal' : 'italic',
            }}
          >
            {value || 'Not set'}
            {unit && value && ` ${unit}`}
          </Typography>
        )}
      </Box>
    );
  }

  // Edit Mode
  return (
    <Fade in={isEditing}>
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          border: `2px solid ${theme.palette.primary.main}`,
          boxShadow: theme.customShadows.z8,
          transition: theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            mb: 1.5,
            display: 'block',
          }}
        >
          {label}
        </Typography>

        {type === 'select' && (
          <Select
            fullWidth
            size="small"
            value={editValue as string}
            onChange={handleChange}
            sx={{
              mb: 2,
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.light,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    minHeight: 40,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                    py: 1,
                    px: 2,
                  },
                },
              },
            }}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        )}

        {type === 'tags' && (
          <Autocomplete
            multiple
            freeSolo
            size="small"
            value={editValue as string[]}
            onChange={handleTagsChange}
            options={options}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={placeholder || 'Add tags'}
                sx={{ bgcolor: 'background.paper' }}
              />
            )}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
              },
            }}
          />
        )}

        {type !== 'select' && type !== 'tags' && (
          <TextField
            fullWidth
            size="small"
            value={editValue}
            onChange={handleChange}
            type={type === 'number' ? 'number' : 'text'}
            multiline={type === 'multiline'}
            rows={type === 'multiline' ? 4 : 1}
            placeholder={placeholder}
            sx={{
              mb: 2,
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.light,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
            }}
          />
        )}

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Tooltip title="Cancel changes" arrow>
            <IconButton
              size="medium"
              onClick={handleCancel}
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.08),
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                  transform: 'scale(1.05)',
                },
                transition: theme.transitions.create(['background-color', 'color', 'transform'], {
                  duration: theme.transitions.duration.shorter,
                }),
              }}
            >
              <Iconify icon="eva:close-fill" width={22} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save changes" arrow>
            <IconButton
              size="medium"
              onClick={handleSave}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.05)',
                  boxShadow: theme.customShadows.primary,
                },
                transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
                  duration: theme.transitions.duration.shorter,
                }),
              }}
            >
              <Iconify icon="eva:checkmark-fill" width={22} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Fade>
  );
}
