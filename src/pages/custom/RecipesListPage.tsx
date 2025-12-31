import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import {
  Tab,
  Tabs,
  Card,
  Button,
  Divider,
  Container,
  Box,
  Pagination,
  Typography,
  Grid,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IRecipe } from '../../@types/recipe';
// _mock_
import { _recipeList } from '../../_mock/arrays';
// components
import Iconify from '../../components/iconify';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
// sections
import RecipeCard from '../../sections/@dashboard/recipe/RecipeCard';
import { RecipeTableToolbar } from '../../sections/@dashboard/recipe/list';

// ----------------------------------------------------------------------

// Consistent form input styling
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

const STATUS_OPTIONS = ['all', 'draft', 'active', 'archived'];

const CUISINE_OPTIONS = [
  'all',
  'Italian',
  'Chinese',
  'French',
  'Japanese',
  'Mexican',
  'Indian',
  'Thai',
  'Mediterranean',
];

const ITEMS_PER_PAGE = 12;

// ----------------------------------------------------------------------

export default function RecipesListPage() {
  const { themeStretch } = useSettingsContext();

  const [tableData, setTableData] = useState(_recipeList);

  const [filterName, setFilterName] = useState('');

  const [filterCuisine, setFilterCuisine] = useState('all');

  const [filterStatus, setFilterStatus] = useState('all');

  const [page, setPage] = useState(1);

  const dataFiltered = applyFilter({
    inputData: tableData,
    filterName,
    filterCuisine,
    filterStatus,
  });

  const isFiltered = filterName !== '' || filterCuisine !== 'all' || filterStatus !== 'all';

  const isNotFound = !dataFiltered.length && isFiltered;

  const totalPages = Math.ceil(dataFiltered.length / ITEMS_PER_PAGE);
  const dataInPage = dataFiltered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterStatus = (event: React.SyntheticEvent<Element, Event>, newValue: string) => {
    setPage(1);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setFilterName(event.target.value);
  };

  const handleFilterCuisine = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setFilterCuisine(event.target.value);
  };

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setTableData(deleteRow);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterCuisine('all');
    setFilterStatus('all');
  };

  return (
    <>
      <Helmet>
        <title> Recipe: List | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Recipe List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Recipes', href: PATH_DASHBOARD.recipes.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              to={PATH_DASHBOARD.recipes.new}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Recipe
            </Button>
          }
        />

        <Card sx={{ mb: { xs: 2, md: 3 } }}>
          <Tabs
            value={filterStatus}
            onChange={handleFilterStatus}
            sx={{
              px: { xs: 1.5, sm: 2 },
              bgcolor: 'background.neutral',
              '& .MuiTab-root': {
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                fontWeight: 600,
                minHeight: { xs: 44, md: 48 },
              },
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab key={tab} label={tab} value={tab} sx={{ textTransform: 'capitalize' }} />
            ))}
          </Tabs>

          <Divider />

          <RecipeTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            filterCuisine={filterCuisine}
            optionsCuisine={CUISINE_OPTIONS}
            onFilterName={handleFilterName}
            onFilterCuisine={handleFilterCuisine}
            onResetFilter={handleResetFilter}
            formInputSx={FORM_INPUT_SX}
          />
        </Card>

        {isNotFound ? (
          <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              paragraph
              sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }, fontWeight: 700 }}
            >
              No results found
            </Typography>

            <Typography 
              variant="body2"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' } }}
            >
              No recipes match your search criteria.&nbsp;
              <Box 
                component="span" 
                sx={{ 
                  color: 'primary.main', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }} 
                onClick={handleResetFilter}
              >
                Try resetting filters
              </Box>
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {dataInPage.map((recipe) => (
                <Grid key={recipe.id} item xs={12} sm={6} md={4} lg={3}>
                  <RecipeCard recipe={recipe} onDelete={() => handleDeleteRow(recipe.id)} />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ mt: { xs: 4, md: 5 }, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handleChangePage}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                      minWidth: { xs: 32, md: 36 },
                      height: { xs: 32, md: 36 },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  filterName,
  filterStatus,
  filterCuisine,
}: {
  inputData: IRecipe[];
  filterName: string;
  filterStatus: string;
  filterCuisine: string;
}) {
  if (filterName) {
    inputData = inputData.filter(
      (recipe) => recipe.dishName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterStatus !== 'all') {
    inputData = inputData.filter((recipe) => recipe.status === filterStatus);
  }

  if (filterCuisine !== 'all') {
    inputData = inputData.filter((recipe) => recipe.cuisineType === filterCuisine);
  }

  return inputData;
}
