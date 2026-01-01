// @mui
import { Box, Card, CardContent, Stack, Skeleton } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonVideoGenerationCard() {
  return (
    <Card
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', width: 1, pt: '56.25%' }}>
        <Skeleton
          variant="rectangular"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </Box>

      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Skeleton variant="circular" sx={{ width: 20, height: 20 }} />
            <Skeleton variant="text" sx={{ width: '70%', height: 24 }} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

