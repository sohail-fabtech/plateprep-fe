// @mui
import { Card, CardContent, Stack, Skeleton } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonDictionaryCategoryCard() {
  return (
    <Card
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Skeleton
            variant="rectangular"
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              flexShrink: 0,
            }}
          />
          <Stack sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" sx={{ width: '80%', height: 24, mb: 0.5 }} />
            <Skeleton variant="text" sx={{ width: '60%', height: 20 }} />
          </Stack>
        </Stack>

        <Stack spacing={1} sx={{ flexGrow: 1, mb: 2 }}>
          <Skeleton variant="text" sx={{ width: '100%', height: 20 }} />
          <Skeleton variant="text" sx={{ width: '95%', height: 20 }} />
          <Skeleton variant="text" sx={{ width: '85%', height: 20 }} />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Skeleton variant="circular" sx={{ width: 16, height: 16 }} />
          <Skeleton variant="text" sx={{ width: 80, height: 16 }} />
        </Stack>
      </CardContent>
    </Card>
  );
}

