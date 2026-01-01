import { Stack, InputAdornment, TextField, MenuItem, Button } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  filterCuisine: string;
  isFiltered: boolean;
  optionsCuisine: string[];
  onResetFilter: VoidFunction;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterCuisine: (event: React.ChangeEvent<HTMLInputElement>) => void;
  formInputSx?: object;
};

export default function RecipeTableToolbar({
  isFiltered,
  filterName,
  filterCuisine,
  optionsCuisine,
  onFilterName,
  onFilterCuisine,
  onResetFilter,
  formInputSx,
}: Props) {
  return (
    <Stack
      spacing={{ xs: 1.5, md: 2 }}
      alignItems="center"
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 2, md: 3 } }}
    >
      <TextField
        fullWidth
        select
        label="Cuisine Type"
        value={filterCuisine}
        onChange={onFilterCuisine}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: {
                maxHeight: 260,
              },
            },
          },
        }}
        sx={{
          maxWidth: { sm: 240 },
          textTransform: 'capitalize',
          ...formInputSx,
        }}
      >
        {optionsCuisine.map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              mx: 1,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
            }}
          >
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Search dish name..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={formInputSx}
      />

      {isFiltered && (
        <Button
          color="error"
          variant="soft"
          sx={{ 
            flexShrink: 0,
            fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
            minWidth: { xs: 80, sm: 100 },
            width: { xs: '100%', sm: 'auto' },
            height: { xs: 40, md: 44 },
            fontWeight: 600,
          }}
          onClick={onResetFilter}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          Clear
        </Button>
      )}
    </Stack>
  );
}
