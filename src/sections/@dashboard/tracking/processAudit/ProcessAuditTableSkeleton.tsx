import { TableRow, TableCell, Skeleton, TableRowProps } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
};

export default function ProcessAuditTableSkeleton({ columnVisibility, dense = false, ...other }: Props & TableRowProps) {
  return (
    <TableRow {...other} sx={{ ...(dense && { height: 52 }) }}>
      {columnVisibility.module && (
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

      {columnVisibility.object && (
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

      {columnVisibility.changedBy && (
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

      {columnVisibility.role && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width={100}
            height={dense ? 20 : 24}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.email && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width={180}
            height={dense ? 20 : 24}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.action && (
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

      {columnVisibility.dateTime && (
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

      {columnVisibility.restaurant && (
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
    </TableRow>
  );
}

