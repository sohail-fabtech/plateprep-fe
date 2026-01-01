import { useTheme, alpha } from '@mui/material/styles';
import { Box, Card, Stack, Typography, IconButton } from '@mui/material';
// @types
import { IVideoTemplate } from '../../../../@types/videoGeneration';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  templates: IVideoTemplate[];
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
};

export default function VideoTemplateSelector({ templates, selectedTemplate, onSelect }: Props) {
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

          return (
            <Card
              key={template.id}
              onClick={() => onSelect(template.id)}
              sx={{
                position: 'relative',
                flexShrink: 0,
                width: { xs: 200, sm: 240, md: 280 },
                cursor: 'pointer',
                border: `2px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
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
                  component="img"
                  src={template.thumbnail}
                  alt={template.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Video Controls Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: alpha('#000', 0.7),
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'common.white',
                      fontSize: { xs: '0.625rem', sm: '0.6875rem' },
                    }}
                  >
                    0:00 / {template.duration}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" sx={{ color: 'common.white', p: 0.5 }}>
                      <Iconify icon="eva:play-fill" width={16} />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'common.white', p: 0.5 }}>
                      <Iconify icon="eva:volume-up-fill" width={16} />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'common.white', p: 0.5 }}>
                      <Iconify icon="eva:maximize-fill" width={16} />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'common.white', p: 0.5 }}>
                      <Iconify icon="eva:more-vertical-fill" width={16} />
                    </IconButton>
                  </Stack>
                </Box>
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
    </Box>
  );
}

