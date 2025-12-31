import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Box, TextField, IconButton, Stack, Typography, Button, useTheme, alpha } from '@mui/material';
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  items: string[];
  onChange: (items: string[]) => void;
  title: string;
  droppableId: string;
  placeholder?: string;
  showUploadImage?: boolean;
  onUploadImage?: () => void;
  error?: boolean;
  helperText?: string;
};

export default function DynamicStepList({
  items,
  onChange,
  title,
  droppableId,
  placeholder = 'Enter step description',
  showUploadImage = false,
  onUploadImage,
  error,
  helperText,
}: Props) {
  const theme = useTheme();

  const handleAdd = () => {
    onChange([...items, '']);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: { xs: 2, md: 2.5 },
          gap: 1,
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
            whiteSpace: { xs: 'nowrap', sm: 'normal' },
            overflow: { xs: 'hidden', sm: 'visible' },
            textOverflow: { xs: 'ellipsis', sm: 'clip' },
            flex: { xs: '1 1 auto', sm: '0 0 auto' },
            minWidth: 0,
          }}
        >
          {title}
        </Typography>
        <Stack 
          direction="row" 
          spacing={{ xs: 0.5, sm: 1 }}
          sx={{ 
            flexShrink: 0,
          }}
        >
          {showUploadImage && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="eva:image-outline" width={16} />}
              onClick={onUploadImage}
              sx={{ 
                minWidth: { xs: 'auto', sm: 120 },
                px: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
                '& .MuiButton-startIcon': {
                  marginRight: { xs: 0.5, sm: 0.75 },
                  '& svg': {
                    width: { xs: 14, sm: 16, md: 18 },
                    height: { xs: 14, sm: 16, md: 18 },
                  },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Upload Image
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                Image
              </Box>
            </Button>
          )}
          <Button
            size="small"
            startIcon={<Iconify icon="eva:plus-fill" width={16} />}
            onClick={handleAdd}
            sx={{ 
              fontWeight: 600,
              minWidth: { xs: 'auto', sm: 100 },
              px: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.6875rem', sm: '0.8125rem', md: '0.875rem' },
              whiteSpace: 'nowrap',
              '& .MuiButton-startIcon': {
                marginRight: { xs: 0.5, sm: 0.75 },
                '& svg': {
                  width: { xs: 14, sm: 16, md: 18 },
                  height: { xs: 14, sm: 16, md: 18 },
                },
              },
            }}
          >
            Add Step
          </Button>
        </Stack>
      </Box>

      <Droppable droppableId={droppableId} type="step">
        {(provided) => (
          <Stack spacing={{ xs: 1, md: 1.5 }} ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item, index) => {
              const itemId = `${droppableId}-${index}`;
              return (
              <Draggable key={itemId} draggableId={itemId} index={index}>
                {(dragProvided, snapshot) => (
                  <Box
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    sx={{
                      display: 'flex',
                      gap: { xs: 0.75, sm: 1, md: 1.5 },
                      p: { xs: 1, sm: 1.25, md: 1.5 },
                      borderRadius: { xs: 1.5, md: 2 },
                      bgcolor: snapshot.isDragging
                        ? alpha(theme.palette.primary.main, 0.08)
                        : alpha(theme.palette.grey[500], 0.04),
                      border: `1px solid ${
                        snapshot.isDragging
                          ? theme.palette.primary.main
                          : alpha(theme.palette.grey[500], 0.12)
                      }`,
                      boxShadow: snapshot.isDragging ? theme.customShadows.z20 : 'none',
                      opacity: snapshot.isDragging ? 0.9 : 1,
                      transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                      userSelect: 'none',
                    }}
                  >
                    {/* Drag Handle */}
                    <Box
                      {...dragProvided.dragHandleProps}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.text.disabled,
                        cursor: 'grab',
                        '&:active': {
                          cursor: 'grabbing',
                        },
                      }}
                    >
                      <Iconify 
                        icon="eva:menu-outline" 
                        width={20}
                        sx={{ 
                          width: { xs: 18, md: 20 },
                          height: { xs: 18, md: 20 },
                        }}
                      />
                    </Box>

                    {/* Input */}
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder={placeholder}
                      value={item}
                      onChange={(e) => handleChange(index, e.target.value)}
                      sx={{ 
                        flex: 1,
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                        },
                      }}
                    />

                    {/* Delete Button */}
                    <IconButton
                      size="small"
                      onClick={() => handleRemove(index)}
                      sx={{
                        width: { xs: 30, md: 36 },
                        height: { xs: 30, md: 36 },
                        color: theme.palette.error.main,
                        alignSelf: 'flex-start',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.08),
                        },
                      }}
                    >
                      <Iconify 
                        icon="eva:close-fill" 
                        width={20}
                        sx={{ 
                          width: { xs: 16, sm: 18, md: 20 },
                          height: { xs: 16, sm: 18, md: 20 },
                        }}
                      />
                    </IconButton>
                  </Box>
                )}
              </Draggable>
            );
            })}
            {provided.placeholder}
            {items.length === 0 && (
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  textAlign: 'center',
                  borderRadius: { xs: 1.5, md: 2 },
                  border: `1px dashed ${alpha(theme.palette.grey[500], 0.32)}`,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  }}
                >
                  No steps added yet. Click &quot;Add Step&quot; to start.
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Droppable>

      {helperText && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: error ? 'error.main' : 'text.secondary', 
            mt: { xs: 0.75, md: 1 }, 
            px: { xs: 0, md: 2 },
            fontSize: { xs: '0.75rem', md: '0.75rem' },
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

