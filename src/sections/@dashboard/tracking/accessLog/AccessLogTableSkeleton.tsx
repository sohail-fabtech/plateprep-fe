import { TableRow, TableCell, Skeleton, TableRowProps } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
};

export default function AccessLogTableSkeleton({ columnVisibility, dense = false, ...other }: Props & TableRowProps) {
  return (
    <TableRow {...other} sx={{ ...(dense && { height: 52 }) }}>
      {columnVisibility.user && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width={150}
            height={dense ? 20 : 24}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.ipAddress && (
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

      {columnVisibility.userAgent && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, maxWidth: 300, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width="100%"
            height={dense ? 20 : 24}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.timestamp && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width={160}
            height={dense ? 20 : 24}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}
    </TableRow>
  );
}

