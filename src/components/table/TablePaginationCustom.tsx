// @mui
import { Theme } from '@mui/material/styles';
import {
  Box,
  Switch,
  SxProps,
  TablePagination,
  FormControlLabel,
  TablePaginationProps,
} from '@mui/material';
//

// ----------------------------------------------------------------------

type Props = {
  dense?: boolean;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: SxProps<Theme>;
};

export default function TablePaginationCustom({
  dense = false,
  onChangeDense,
  rowsPerPageOptions = [5, 10, 25],
  sx,
  ...other
}: Props & TablePaginationProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        ...sx,
      }}
    >
      {onChangeDense && (
        <FormControlLabel
          label="Dense"
          control={<Switch checked={!!dense} onChange={onChangeDense} />}
          sx={{
            display: { xs: 'none', sm: 'flex' }, // Hide on mobile, show on tablet+
            mr: 2,
            '& .MuiFormControlLabel-label': {
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
            },
          }}
        />
      )}

      <Box sx={{ flex: 1 }}>
        <TablePagination rowsPerPageOptions={rowsPerPageOptions} component="div" {...other} />
      </Box>
    </Box>
  );
}
