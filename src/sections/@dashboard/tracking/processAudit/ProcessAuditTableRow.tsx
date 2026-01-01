import { TableRow, TableCell, Typography, Chip } from '@mui/material';
// @types
import { IProcessAudit } from '../../../../@types/tracking';
// utils
import { fDateTime } from '../../../../utils/formatTime';

// ----------------------------------------------------------------------

type Props = {
  row: IProcessAudit;
  columnVisibility: Record<string, boolean>;
  dense?: boolean;
};

export default function ProcessAuditTableRow({ row, columnVisibility, dense = false }: Props) {
  const {
    modelName,
    objectRepr,
    changedByName,
    userRole,
    userEmail,
    actionDisplay,
    timestamp,
    restaurantName,
  } = row;

  const getActionColor = (
    action: string
  ): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'delete':
      case 'permanent delete':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <TableRow hover>
      {columnVisibility.module && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {modelName}
          </Typography>
        </TableCell>
      )}

      {columnVisibility.object && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {objectRepr}
          </Typography>
        </TableCell>
      )}

      {columnVisibility.changedBy && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {changedByName}
          </Typography>
        </TableCell>
      )}

      {columnVisibility.role && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {userRole}
          </Typography>
        </TableCell>
      )}

      {columnVisibility.email && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {userEmail}
          </Typography>
        </TableCell>
      )}

      {columnVisibility.action && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Chip label={actionDisplay} size="small" color={getActionColor(actionDisplay)} />
        </TableCell>
      )}

      {columnVisibility.dateTime && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {fDateTime(timestamp)}
          </Typography>
        </TableCell>
      )}

      {columnVisibility.restaurant && (
        <TableCell sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {restaurantName}
          </Typography>
        </TableCell>
      )}
    </TableRow>
  );
}

