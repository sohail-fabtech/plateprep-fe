import { useTheme, alpha } from '@mui/material/styles';
import { Box, Card, Stack, Typography, FormHelperText } from '@mui/material';
// @types
import { IVideoTemplate } from '../../../../@types/videoGeneration';

// ----------------------------------------------------------------------

type Props = {
  templates: IVideoTemplate[];
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
  error?: boolean;
  helperText?: string;
};

export default function VideoTemplateSelector({ templates, selectedTemplate, onSelect, error, helperText }: Props) {
  const theme = useTheme();

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          mb: { xs: 2, md: 3 },
          fontWeight: 700,
          fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
        }}
      >
        Select Video Template
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          overflowX: 'auto',
          pb: { xs: 1, md: 0 },
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.grey[600], 0.48),
            borderRadius: 4,
          },
        }}
      >
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          // Show error border on all templates if error exists and no template is selected
          const showErrorBorder = error && !selectedTemplate;

          return (
            <Card
              key={template.id}
              onClick={() => onSelect(template.id)}
              sx={{
                position: 'relative',
                flexShrink: 0,
                width: { xs: 200, sm: 240, md: 280 },
                cursor: 'pointer',
                border: `2px solid ${
                  showErrorBorder
                    ? theme.palette.error.main
                    : isSelected
                    ? theme.palette.primary.main
                    : 'transparent'
                }`,
                borderRadius: 2,
                overflow: 'hidden',
                transition: theme.transitions.create(['border-color', 'transform', 'box-shadow'], {
                  duration: theme.transitions.duration.shorter,
                }),
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.customShadows.z20,
                },
              }}
            >
              <Box sx={{ position: 'relative', width: 1, pt: '56.25%' }}>
                <Box
                  component="video"
                  src={template.videoUrl}
                  controls
                  preload="metadata"
                  muted
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>

              <Stack spacing={0.5} sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    fontWeight: 600,
                  }}
                >
                  Duration: {template.duration}
                </Typography>
              </Stack>
            </Card>
          );
        })}
      </Box>
      
      {error && helperText && (
        <FormHelperText
          error
          sx={{
            mt: 1,
            mx: 0,
            fontSize: { xs: '0.75rem', md: '0.75rem' },
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
}

