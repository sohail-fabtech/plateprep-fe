import { TableRow, TableCell, Skeleton, TableRowProps } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
  rowsPerPage?: number;
};

export default function SchedulingTableSkeleton({ columnVisibility, dense = false, rowsPerPage = 5, ...other }: Props & TableRowProps) {
  return (
    <>
      {[...Array(rowsPerPage)].map((_, index) => (
        <TableRow key={index} {...other} sx={{ ...(dense && { height: 52 }) }}>
          {columnVisibility.dishName && (
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

          {columnVisibility.scheduleDatetime && (
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

          {columnVisibility.season && (
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

          {columnVisibility.holiday && (
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

          {columnVisibility.createdAt && (
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

          <TableCell align="right" sx={{ px: { xs: 1.5, md: 2 }, ...(dense && { py: 1 }) }}>
            <Skeleton
              variant="circular"
              width={dense ? 36 : 40}
              height={dense ? 36 : 40}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

