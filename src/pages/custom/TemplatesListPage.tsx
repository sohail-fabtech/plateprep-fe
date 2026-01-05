import { Helmet } from 'react-helmet-async';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Tab,
  Tabs,
  Card,
  Button,
  Divider,
  Container,
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
} from '@mui/material';
// routes
import { PATH_DASHBOARD, PATH_PAGE } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import TemplateCreationDialog from '../../components/template-creation-dialog';
// import { SkeletonTemplateCard } from '../../components/skeleton';
// sections
import TemplateCard from '../../sections/@dashboard/template/TemplateCard';
// mock data
import { _templateList } from '../../_mock/arrays/_template';
import { ITemplate, ITemplateStatus } from '../../@types/template';

// ----------------------------------------------------------------------

const STATUS_OPTIONS: ITemplateStatus[] = ['all', 'draft', 'active', 'archived'];

// ----------------------------------------------------------------------

export default function TemplatesListPage() {
  const { themeStretch } = useSettingsContext();
  const navigate = useNavigate();

  const [templateCreationDialogOpen, setTemplateCreationDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<ITemplateStatus>('all');

  // Filter templates based on status and name
  const dataFiltered = useMemo(() => {
    let filtered = _templateList;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((template) => {
        if (filterStatus === 'archived') {
          return template.status === 'archived' || !template.isAvailable;
        }
        return template.status === filterStatus;
      });
    }

    // Filter by name
    if (filterName) {
      const searchLower = filterName.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchLower) ||
          (template.description && template.description.toLowerCase().includes(searchLower)) ||
          (template.category && template.category.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [filterStatus, filterName]);

  const handleFilterStatus = (event: React.SyntheticEvent<Element, Event>, newValue: string) => {
    setFilterStatus(newValue as ITemplateStatus);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  const handleCreateTemplate = () => {
    setTemplateCreationDialogOpen(true);
  };

  const isFiltered = filterName !== '' || filterStatus !== 'all';
  const isNotFound = dataFiltered.length === 0 && isFiltered;

  return (
    <>
      <Helmet>
        <title> Templates | Minimal UI</title>
      </Helmet>

      <TemplateCreationDialog
        open={templateCreationDialogOpen}
        onClose={() => setTemplateCreationDialogOpen(false)}
        onRecipeTemplateClick={() => {
          navigate(PATH_DASHBOARD.templates.create);
        }}
        onManualTemplateClick={() => {
          navigate(PATH_PAGE.templateEditor);
        }}
      />

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Templates"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Templates', href: PATH_DASHBOARD.templates.list },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleCreateTemplate}
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                height: { xs: 40, sm: 42, md: 44 },
                fontWeight: 600,
              }}
            >
              New Template
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

          <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <TextField
              fullWidth
              placeholder="Search templates..."
              value={filterName}
              onChange={handleFilterName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: { xs: '100%', sm: 320 },
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  height: { xs: 40, sm: 42, md: 44 },
                },
              }}
            />
          </Box>
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
              No templates match your search criteria.
            </Typography>
          </Box>
        ) : dataFiltered.length > 0 ? (
          <>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {dataFiltered.map((template) => (
                <Grid key={template.id} item xs={12} sm={6} md={4} lg={3}>
                  <TemplateCard
                    template={template}
                    filterStatus={filterStatus}
                    canEdit={true}
                    canDelete={true}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
            <Typography
              variant="h6"
              paragraph
              sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }, fontWeight: 700 }}
            >
              No templates found
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' } }}
            >
              Get started by creating a new template.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}
