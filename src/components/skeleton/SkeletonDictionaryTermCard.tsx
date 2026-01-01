// @mui
import { Card, CardContent, Stack, Skeleton, Divider } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonDictionaryTermCard() {
  return (
    <Card
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Skeleton
              variant="rectangular"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
            <Stack sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" sx={{ width: '70%', height: 28, mb: 1 }} />
              <Skeleton variant="text" sx={{ width: '85%', height: 22 }} />
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Skeleton variant="text" sx={{ width: '100%', height: 20 }} />
            <Skeleton variant="text" sx={{ width: '95%', height: 20 }} />
            <Skeleton variant="text" sx={{ width: '90%', height: 20 }} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

