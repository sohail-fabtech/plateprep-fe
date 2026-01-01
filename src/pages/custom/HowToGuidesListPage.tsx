import orderBy from 'lodash/orderBy';
import { Helmet } from 'react-helmet-async';
import { useState, useMemo } from 'react';
// @mui
import { Grid, Container, Stack, Typography, Box } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IHowToGuide, IHowToFilterCategory, IHowToSortBy } from '../../@types/howTo';
// components
import { SkeletonPostItem } from '../../components/skeleton';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import SearchNotFound from '../../components/search-not-found';
// sections
import {
  HowToGuideCard,
  HowToCategoryFilter,
  HowToGuidesSearch,
  HowToGuidesSort,
} from '../../sections/@dashboard/howTo';
// mock
import { _howToGuides } from '../../_mock/arrays';

// ----------------------------------------------------------------------

export default function HowToGuidesListPage() {
  const { themeStretch } = useSettingsContext();

  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState<IHowToFilterCategory>('All');
  const [sortBy, setSortBy] = useState<IHowToSortBy>('latest');

  const dataFiltered = applyFilter({
    inputData: _howToGuides,
    filterName,
    filterCategory,
    sortBy,
  });

  const isNotFound = !dataFiltered.length && !!filterName;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  const handleFilterCategory = (category: IHowToFilterCategory) => {
    setFilterCategory(category);
  };

  const handleChangeSortBy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy(event.target.value as IHowToSortBy);
  };

  return (
    <>
      <Helmet>
        <title> How To Guides | PlatePrep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="How To Guides"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'How To',
              href: PATH_DASHBOARD.howTo.root,
            },
            {
              name: 'Guides',
            },
          ]}
        />

        <Stack spacing={3} sx={{ mb: 5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <HowToGuidesSearch filterName={filterName} onFilterName={handleFilterName} />
            <HowToGuidesSort sortBy={sortBy} onSort={handleChangeSortBy} />
          </Stack>

          <HowToCategoryFilter filterCategory={filterCategory} onFilterCategory={handleFilterCategory} />
        </Stack>

        {isNotFound ? (
          <SearchNotFound query={filterName} />
        ) : (
          <Grid
            container
            spacing={3}
            sx={{
              ...(dataFiltered.length === 0 && {
                minHeight: 400,
              }),
            }}
          >
            {dataFiltered.length === 0 ? (
              [...Array(8)].map((_, index) => (
                <Grid key={index} item xs={12} sm={6} md={4}>
                  <SkeletonPostItem />
                </Grid>
              ))
            ) : (
              dataFiltered.map((guide, index) => (
                <Grid
                  key={guide.id}
                  item
                  xs={12}
                  sm={6}
                  md={guide.featured && index === 0 ? 8 : 4}
                >
                  <HowToGuideCard guide={guide} index={index} />
                </Grid>
              ))
            )}
          </Grid>
        )}

        {dataFiltered.length === 0 && !filterName && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              No guides found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Check back later for new guides and tutorials.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

type FilterProps = {
  inputData: IHowToGuide[];
  filterName: string;
  filterCategory: IHowToFilterCategory;
  sortBy: IHowToSortBy;
};

function applyFilter({ inputData, filterName, filterCategory, sortBy }: FilterProps) {
  let filtered = inputData;

  // Filter by name
  if (filterName) {
    filtered = filtered.filter(
      (guide) =>
        guide.title.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        guide.description.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  // Filter by category
  if (filterCategory !== 'All') {
    filtered = filtered.filter((guide) => guide.category === filterCategory);
  }

  // Sort
  if (sortBy === 'latest') {
    filtered = orderBy(filtered, ['createdAt'], ['desc']);
  } else if (sortBy === 'popular') {
    filtered = orderBy(filtered, ['popular', 'view'], ['desc', 'desc']);
  } else if (sortBy === 'mostViewed') {
    filtered = orderBy(filtered, ['view'], ['desc']);
  } else if (sortBy === 'mostHelpful') {
    filtered = orderBy(filtered, ['helpful'], ['desc']);
  }

  return filtered;
}

