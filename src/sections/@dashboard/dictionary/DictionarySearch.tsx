// @mui
import { InputAdornment } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import { CustomTextField } from '../../../components/custom-input';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

export default function DictionarySearch({ filterName, onFilterName, placeholder = 'Search categories...' }: Props) {
  return (
    <CustomTextField
      fullWidth
      size="small"
      value={filterName}
      onChange={onFilterName}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
      sx={{
        maxWidth: { xs: 1, sm: 320 },
      }}
    />
  );
}

