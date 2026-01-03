import { TableRow, TableCell, Skeleton, TableRowProps } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
};

export default function TaskTableSkeleton({ columnVisibility, dense = false, ...other }: Props & TableRowProps) {
  return (
    <TableRow {...other} sx={{ ...(dense && { height: 52 }) }}>
      {columnVisibility.staffName && (
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

      {columnVisibility.taskName && (
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

      {columnVisibility.taskDescription && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, maxWidth: 300, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="text"
            width="100%"
            height={dense ? 20 : 48}
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.status && (
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

      {columnVisibility.priority && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="rectangular"
            width={70}
            height={24}
            sx={{
              borderRadius: 1,
              fontSize: { xs: '0.6875rem', md: '0.75rem' },
            }}
          />
        </TableCell>
      )}

      {columnVisibility.archiveStatus && (
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

      {columnVisibility.assignedToMe && (
        <TableCell sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
          <Skeleton
            variant="rectangular"
            width={50}
            height={24}
            sx={{
              borderRadius: 1,
              fontSize: { xs: '0.6875rem', md: '0.75rem' },
            }}
          />
        </TableCell>
      )}

      <TableCell align="right" sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
        <Skeleton
          variant="circular"
          width={dense ? 36 : 40}
          height={dense ? 36 : 40}
        />
      </TableCell>
    </TableRow>
  );
}

