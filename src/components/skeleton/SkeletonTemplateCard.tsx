import { Card, Skeleton, Stack, Box, CardProps } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonTemplateCard({ ...other }: CardProps) {
  return (
    <Card {...other}>
      <Box sx={{ position: 'relative', p: { xs: 0.75, sm: 1 } }}>
        {/* Image skeleton */}
        <Skeleton
          variant="rectangular"
          width="100%"
          sx={{ 
            borderRadius: 1.5,
            aspectRatio: '16/9',
          }}
        />
        
        {/* Status label skeleton */}
        <Skeleton
          variant="circular"
          width={60}
          height={24}
          sx={{
            position: 'absolute',
            top: { xs: 12, sm: 16 },
            left: { xs: 12, sm: 16 },
          }}
        />
      </Box>

      <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        {/* Title skeleton */}
        <Skeleton variant="text" width="80%" height={24} />

        {/* Description skeleton */}
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="60%" height={20} />

        {/* Buttons skeleton */}
        <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }}>
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </Stack>
    </Card>
  );
}

