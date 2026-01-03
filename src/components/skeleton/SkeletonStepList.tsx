import { Box, Skeleton, Stack, Typography, useTheme, alpha } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  count?: number;
};

export default function SkeletonStepList({ title, count = 3 }: Props) {
  const theme = useTheme();

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 1.5, md: 2 },
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
          }}
        >
          {title}
        </Typography>
        <Skeleton
          variant="rectangular"
          width={120}
          height={32}
          sx={{
            borderRadius: 1,
            display: { xs: 'none', sm: 'block' },
          }}
        />
        <Skeleton
          variant="rectangular"
          width={60}
          height={32}
          sx={{
            borderRadius: 1,
            display: { xs: 'block', sm: 'none' },
          }}
        />
      </Box>

      {/* Items */}
      <Stack spacing={1.5}>
        {[...Array(count)].map((_, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              gap: 1.5,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            }}
          >
            {/* Drag Handle */}
            <Skeleton
              variant="rectangular"
              width={20}
              height={20}
              sx={{
                borderRadius: 0.5,
                alignSelf: 'flex-start',
                mt: 0.5,
              }}
            />

            {/* Multiline Text Field */}
            <Skeleton
              variant="rectangular"
              width="100%"
              height={72}
              sx={{
                borderRadius: 1,
                flex: 1,
              }}
            />

            {/* Delete Button */}
            <Skeleton
              variant="circular"
              width={36}
              height={36}
              sx={{
                alignSelf: 'flex-start',
              }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

