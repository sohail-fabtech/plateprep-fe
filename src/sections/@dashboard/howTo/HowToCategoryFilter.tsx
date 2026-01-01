import { useState } from 'react';
// @mui
import { Box, Chip, Stack } from '@mui/material';
// @types
import { IHowToCategory, IHowToFilterCategory } from '../../../@types/howTo';

// ----------------------------------------------------------------------

const CATEGORIES: IHowToCategory[] = [
  'Getting Started',
  'Recipes Management',
  'Tasks & Scheduling',
  'Wine Inventory',
  'Restaurant Locations',
  'User Management',
  'Settings & Configuration',
  'Troubleshooting',
];

type Props = {
  filterCategory: IHowToFilterCategory;
  onFilterCategory: (category: IHowToFilterCategory) => void;
};

export default function HowToCategoryFilter({ filterCategory, onFilterCategory }: Props) {
  return (
    <Stack direction="row" flexWrap="wrap" spacing={1}>
      <Chip
        label="All"
        onClick={() => onFilterCategory('All')}
        variant={filterCategory === 'All' ? 'filled' : 'outlined'}
        color={filterCategory === 'All' ? 'primary' : 'default'}
        sx={{
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          height: { xs: 28, sm: 32 },
        }}
      />
      {CATEGORIES.map((category) => (
        <Chip
          key={category}
          label={category}
          onClick={() => onFilterCategory(category)}
          variant={filterCategory === category ? 'filled' : 'outlined'}
          color={filterCategory === category ? 'primary' : 'default'}
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            height: { xs: 28, sm: 32 },
          }}
        />
      ))}
    </Stack>
  );
}

