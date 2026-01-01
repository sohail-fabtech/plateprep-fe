import { TableRow, TableCell, Typography, Stack } from '@mui/material';
// @types
import { IAccessLog } from '../../../../@types/tracking';
// utils
import { fDateTime } from '../../../../utils/formatTime';

// ----------------------------------------------------------------------

type Props = {
  row: IAccessLog;
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
};

export default function AccessLogTableRow({ row, columnVisibility, dense = false }: Props) {
  const { user, ipAddress, userAgent, timestamp } = row;

  return (
    <TableRow hover>
      {columnVisibility.user && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user.fullName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user.email}
            </Typography>
          </Stack>
        </TableCell>
      )}

      {columnVisibility.ipAddress && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {ipAddress}
          </Typography>
        </TableCell>
      )}

      {columnVisibility.userAgent && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={userAgent}
          >
            {userAgent}
          </Typography>
        </TableCell>
      )}

      {columnVisibility.timestamp && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {fDateTime(timestamp)}
          </Typography>
        </TableCell>
      )}
    </TableRow>
  );
}

