// @mui
import { InputAdornment } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import { CustomTextField } from '../../../components/custom-input';

// ----------------------------------------------------------------------

// Consistent Form Styling System (Matching Recipe, Task & Restaurant Forms)
const FORM_INPUT_SX = {
  '& .MuiInputBase-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiInputLabel-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiFormHelperText-root': {
    fontSize: { xs: '0.75rem', md: '0.75rem' },
  },
};

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function VideoGenerationSearch({ filterName, onFilterName }: Props) {
  return (
    <CustomTextField
      fullWidth
      size="small"
      value={filterName}
      onChange={onFilterName}
      placeholder="Search videos by dish name..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
      sx={{
        maxWidth: { xs: 1, sm: 320 },
        ...FORM_INPUT_SX,
      }}
    />
  );
}

