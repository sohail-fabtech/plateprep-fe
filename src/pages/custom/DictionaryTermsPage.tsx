import { Helmet } from 'react-helmet-async';
import { useState, useMemo, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
// @mui
import { Grid, Container, Stack, Typography, Box, Button } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IDictionaryTerm } from '../../@types/dictionary';
// components
import { SkeletonDictionaryTermCard } from '../../components/skeleton';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import SearchNotFound from '../../components/search-not-found';
import Iconify from '../../components/iconify';
// sections
import { DictionaryTermCard, DictionarySearch } from '../../sections/@dashboard/dictionary';
// mock
import { _dictionaryCategories, _dictionaryTerms } from '../../_mock/arrays';

// ----------------------------------------------------------------------

export default function DictionaryTermsPage() {
  const { themeStretch } = useSettingsContext();

  const { categoryId } = useParams<{ categoryId: string }>();

  const [filterName, setFilterName] = useState('');
  const [loading, setLoading] = useState(true);

  const category = useMemo(() => {
    if (!categoryId) return null;
    return _dictionaryCategories.find((cat) => cat.id === Number(categoryId)) || null;
  }, [categoryId]);

  const terms = useMemo(() => {
    if (!categoryId) return [];
    return _dictionaryTerms[Number(categoryId)] || [];
  }, [categoryId]);

  // Simulate loading state
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 500ms loading delay

    return () => clearTimeout(timer);
  }, [categoryId]);

  const dataFiltered = useMemo(() => {
    let filtered = terms;

    if (filterName) {
      filtered = filtered.filter(
        (term) =>
          term.term.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
          term.definition.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
          term.description.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
    }

    return filtered;
  }, [terms, filterName]);

  const isNotFound = !dataFiltered.length && !!filterName;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  if (!category) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            Category not found
          </Typography>
          <Button component={RouterLink} to={PATH_DASHBOARD.dictionary.root} variant="contained">
            Back to Dictionary
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${category.name} - Dictionary | PlatePrep`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={category.name}
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Dictionary',
              href: PATH_DASHBOARD.dictionary.root,
            },
            {
              name: category.name,
            },
          ]}
          action={
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              component={RouterLink}
              to={PATH_DASHBOARD.dictionary.root}
            >
              Back to Categories
            </Button>
          }
        />

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {category.description}
          </Typography>
        </Stack>

        <Stack spacing={3} sx={{ mb: 5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <DictionarySearch filterName={filterName} onFilterName={handleFilterName} placeholder="Search terms..." />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {dataFiltered.length} {dataFiltered.length === 1 ? 'term' : 'terms'}
            </Typography>
          </Stack>
        </Stack>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid key={index} item xs={12} md={6}>
                <SkeletonDictionaryTermCard />
              </Grid>
            ))}
          </Grid>
        ) : isNotFound ? (
          <SearchNotFound query={filterName} />
        ) : dataFiltered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              No terms found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              This category doesn't have any terms yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {dataFiltered.map((term) => (
              <Grid key={term.id} item xs={12} md={6}>
                <DictionaryTermCard term={term} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}

