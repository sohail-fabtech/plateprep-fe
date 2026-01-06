import { TableRow, TableCell, Skeleton, Stack, TableRowProps } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
};

export default function WineInventoryTableSkeleton({
  columnVisibility,
  dense = false,
  ...other
}: Props & TableRowProps) {
  return (
    <TableRow {...other} sx={{ ...(dense && { height: 52 }) }}>
      {columnVisibility.wineName && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton
              variant="rectangular"
              width={dense ? 40 : 48}
              height={dense ? 40 : 48}
              sx={{ borderRadius: 1.5, flexShrink: 0 }}
            />
            <Skeleton
              variant="text"
              width={150}
              height={dense ? 20 : 24}
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              }}
            />
          </Stack>
        </TableCell>
      )}

      {columnVisibility.wineType && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width={80}
            height={dense ? 20 : 24}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.region && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width={120}
            height={dense ? 20 : 24}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.vintage && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width={60}
            height={dense ? 20 : 24}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.totalStock && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width={60}
            height={dense ? 20 : 24}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.stockStatus && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{
              borderRadius: 1,
              fontSize: { xs: '0.6875rem', md: '0.75rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.tags && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Stack direction="row" spacing={0.5}>
            <Skeleton
              variant="rectangular"
              width={60}
              height={dense ? 20 : 24}
              sx={{
                borderRadius: 1,
                fontSize: { xs: '0.6875rem', md: '0.75rem' },
              }}
            />
            <Skeleton
              variant="rectangular"
              width={70}
              height={dense ? 20 : 24}
              sx={{
                borderRadius: 1,
                fontSize: { xs: '0.6875rem', md: '0.75rem' },
              }}
            />
          </Stack>
        </TableCell>
      )}

      {columnVisibility.location && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width={120}
            height={dense ? 20 : 24}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}

      <TableCell align="right" sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
        <Skeleton variant="circular" width={dense ? 36 : 40} height={dense ? 36 : 40} />
      </TableCell>
    </TableRow>
  );
}

