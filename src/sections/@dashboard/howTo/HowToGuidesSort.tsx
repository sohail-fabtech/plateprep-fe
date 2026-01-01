// @mui
import { MenuItem } from '@mui/material';
// components
import { CustomTextField } from '../../../components/custom-input';
// @types
import { IHowToSortBy } from '../../../@types/howTo';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'mostViewed', label: 'Most Viewed' },
  { value: 'mostHelpful', label: 'Most Helpful' },
];

type Props = {
  sortBy: IHowToSortBy;
  onSort: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function HowToGuidesSort({ sortBy, onSort }: Props) {
  return (
    <CustomTextField
      select
      size="small"
      value={sortBy}
      onChange={onSort}
      sx={{
        width: { xs: 1, sm: 160 },
      }}
    >
      {SORT_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </CustomTextField>
  );
}

