// @mui
import { Box, Skeleton, Stack } from '@mui/material';
// config
import { NAV } from '../../config-global';

// ----------------------------------------------------------------------

type Props = {
  depth?: number;
  sx?: object;
};

export default function SkeletonNavItem({ depth = 1, sx }: Props) {
  const subItem = depth !== 1;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        px: 2,
        py: 1.5,
        mb: 0.5,
        height: subItem ? NAV.H_DASHBOARD_ITEM_SUB : NAV.H_DASHBOARD_ITEM,
        ...(subItem && {
          pl: depth * 2 + 2,
        }),
        ...sx,
      }}
    >
      {!subItem && (
        <Skeleton
          variant="rectangular"
          width={24}
          height={24}
          sx={{
            borderRadius: 1.5,
            flexShrink: 0,
          }}
        />
      )}

      {subItem && (
        <Skeleton
          variant="circular"
          width={6}
          height={6}
          sx={{
            flexShrink: 0,
          }}
        />
      )}

      <Skeleton
        variant="text"
        sx={{
          flexGrow: 1,
          height: 16,
          maxWidth: subItem ? '60%' : '80%',
        }}
      />
    </Stack>
  );
}

