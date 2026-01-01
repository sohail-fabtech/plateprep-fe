import { Helmet } from 'react-helmet-async';
import { useState, useMemo, useEffect } from 'react';
// @mui
import { Grid, Container, Stack, Typography, Box } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IDictionaryCategory } from '../../@types/dictionary';
// components
import { SkeletonDictionaryCategoryCard } from '../../components/skeleton';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import SearchNotFound from '../../components/search-not-found';
// sections
import { DictionaryCategoryCard, DictionarySearch } from '../../sections/@dashboard/dictionary';
// mock
import { _dictionaryCategories } from '../../_mock/arrays';

// ----------------------------------------------------------------------

export default function DictionaryListPage() {
  const { themeStretch } = useSettingsContext();

  const [filterName, setFilterName] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 500ms loading delay

    return () => clearTimeout(timer);
  }, []);

  const dataFiltered = useMemo(() => {
    let filtered = _dictionaryCategories;

    if (filterName) {
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
          category.description.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
    }

    return filtered;
  }, [filterName]);

  const isNotFound = !dataFiltered.length && !!filterName;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  return (
    <>
      <Helmet>
        <title> Dictionary | PlatePrep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Dictionary"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Dictionary',
            },
          ]}
        />

        <Stack spacing={3} sx={{ mb: 5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <DictionarySearch filterName={filterName} onFilterName={handleFilterName} />
          </Stack>
        </Stack>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid key={index} item xs={12} sm={6} md={4}>
                <SkeletonDictionaryCategoryCard />
              </Grid>
            ))}
          </Grid>
        ) : isNotFound ? (
          <SearchNotFound query={filterName} />
        ) : dataFiltered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              No categories found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Check back later for new dictionary categories.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {dataFiltered.map((category) => (
              <Grid key={category.id} item xs={12} sm={6} md={4}>
                <DictionaryCategoryCard category={category} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}

