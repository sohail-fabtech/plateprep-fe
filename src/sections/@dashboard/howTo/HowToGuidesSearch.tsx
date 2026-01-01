import { useState } from 'react';
// @mui
import { InputAdornment } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import { CustomTextField } from '../../../components/custom-input';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function HowToGuidesSearch({ filterName, onFilterName }: Props) {
  return (
    <CustomTextField
      fullWidth
      size="small"
      value={filterName}
      onChange={onFilterName}
      placeholder="Search guides..."
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

