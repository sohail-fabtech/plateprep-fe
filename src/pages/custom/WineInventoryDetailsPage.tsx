import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import {
  Container,
  Button,
  Typography,
  Card,
  CardHeader,
  Grid,
  Stack,
  Box,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import ConfirmDialog from '../../components/confirm-dialog';
import MenuPopover from '../../components/menu-popover';
import Image from '../../components/image';
import Label from '../../components/label';
import SvgColor from '../../components/svg-color';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// hooks
import { usePermissions } from '../../hooks/usePermissions';
// types
import { IWineInventory } from '../../@types/wineInventory';
// services
import { useWineInventory, useUpdateWineInventory } from '../../services/wineInventory/wineInventoryHooks';
// sections
import EditableField from '../../sections/@dashboard/recipe/EditableField';

// ----------------------------------------------------------------------

// Icon helper - same as sidebar navigation
const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

// ----------------------------------------------------------------------

const BOTTLE_SIZES = [
  { key: '187.5', label: 'Split / Piccolo', size: '187.5ml', icon: 'mdi:bottle-wine' },
  { key: '375', label: 'Demi / Half', size: '375ml', icon: 'mdi:bottle-wine' },
  { key: '750', label: 'Standard', size: '750ml', icon: 'mdi:bottle-wine' },
  { key: '1500', label: 'Magnum', size: '1.5L', icon: 'mdi:bottle-wine' },
  { key: '3000', label: 'Jeroboam', size: '3L', icon: 'mdi:bottle-wine' },
];

// Mock AI Pairing Ideas (read-only)
const MOCK_AI_PAIRINGS = {
  cheese: ['Aged Cheddar', 'Toasted Almonds', 'Parmesan'],
  meat: ['Grilled Ribeye', 'Roasted Duck', 'Lamb Chops'],
  desserts: ['Bittersweet Chocolate', 'Espresso Gelato', 'Crème Brûlée'],
};

// Summary cards data
const SUMMARY_CARDS = [
  {
    title: 'In Stock',
    description: 'Available for pairing',
    icon: 'eva:checkmark-circle-2-fill',
    color: 'success',
  },
  {
    title: 'Low Stock Alert',
    description: 'Replenish soon',
    icon: 'eva:alert-circle-fill',
    color: 'warning',
  },
  {
    title: 'Out of Stock',
    description: 'Order required',
    icon: 'eva:close-circle-fill',
    color: 'error',
  },
];

export default function WineInventoryDetailsPage() {
  const { id } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Check if user has edit permission
  const canEdit = hasPermission('edit_wine_inventory');

  // Fetch wine data using real API
  const { data: wineData, isLoading: loading, isError, error } = useWineInventory(id);
  const updateWineMutation = useUpdateWineInventory();

  // Handle field edit
  const handleFieldEdit = useCallback((fieldName: string) => {
    setEditingField(fieldName);
  }, []);

  // Handle field save with API call
  const handleFieldSave = useCallback(
    async (fieldName: string, value: string | number | string[]) => {
      if (!wineData || !id) return;

      try {
        const updateData: Record<string, any> = {};
        
        // Map UI field names to API field names
        if (fieldName === 'wineName') {
          updateData.wine_name = value;
        } else if (fieldName === 'description') {
          updateData.description = value;
        } else if (fieldName === 'producer') {
          updateData.producer = value;
        } else if (fieldName === 'vintage') {
          updateData.vintage = value ? parseInt(String(value)) : null;
        } else if (fieldName === 'wineProfile') {
          updateData.wine_profile = value;
        } else if (fieldName === 'tags') {
          updateData.tags = value;
        } else {
          updateData[fieldName] = value;
        }

        await updateWineMutation.mutateAsync({ id, data: updateData });
        setEditingField(null);
        enqueueSnackbar('Field updated successfully!', { variant: 'success' });
      } catch (err) {
        console.error('Error saving field:', err);
        enqueueSnackbar('Failed to update field', { variant: 'error' });
      }
    },
    [wineData, id, updateWineMutation, enqueueSnackbar]
  );

  // Handle field cancel
  const handleFieldCancel = useCallback(() => {
    setEditingField(null);
  }, []);

  // Handle delete wine
  const handleDeleteWine = useCallback(async () => {
    if (!wineData) return;

    try {
      console.log('✅ [WINE DELETED]', { wineId: wineData.id });
      enqueueSnackbar('Wine deleted successfully!', { variant: 'success' });
      navigate(PATH_DASHBOARD.wineInventory.list);
    } catch (err) {
      console.error('Error deleting wine:', err);
      enqueueSnackbar('Failed to delete wine', { variant: 'error' });
    } finally {
      setOpenDeleteConfirm(false);
    }
  }, [wineData, enqueueSnackbar, navigate]);

  // Get stock status color
  const getStockStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'IN_STOCK':
        return 'success';
      case 'LOW':
        return 'warning';
      case 'OUT':
        return 'error';
      default:
        return 'warning';
    }
  };

  // Get stock status label
  const getStockStatusLabel = (status: string): string => {
    switch (status) {
      case 'IN_STOCK':
        return 'In Stock';
      case 'LOW':
        return 'Low Stock';
      case 'OUT':
        return 'Out of Stock';
      default:
        return status;
    }
  };

  // Get summary card based on stock status
  const getSummaryCard = () => {
    const status = wineData?.stockStatus || 'IN_STOCK';
    if (status === 'IN_STOCK') return SUMMARY_CARDS[0];
    if (status === 'LOW') return SUMMARY_CARDS[1];
    return SUMMARY_CARDS[2];
  };

  if (loading) {
    return (
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError || !wineData) {
    return (
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h6" color="error">
            {isError && error instanceof Error ? error.message : 'Wine not found'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(PATH_DASHBOARD.wineInventory.list)}
            sx={{ mt: 2 }}
          >
            Back to Wine Inventory
          </Button>
        </Box>
      </Container>
    );
  }

  const summaryCard = getSummaryCard();

  return (
    <>
      <Helmet>
        <title>{`Wine: ${wineData.wineName} | Plateprep`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Wine Details"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Wine Inventory',
              href: PATH_DASHBOARD.wineInventory.root,
            },
            { name: wineData.wineName },
          ]}
          action={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:edit-fill" />}
                  onClick={() => navigate(PATH_DASHBOARD.wineInventory.edit(id!))}
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    height: { xs: 36, sm: 40, md: 42 },
                  }}
                >
                  Full Edit Mode
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => navigate(PATH_DASHBOARD.wineInventory.create)}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                  height: { xs: 36, sm: 40, md: 42 },
                }}
              >
                New Wine
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Hero Section */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: 4, md: 6 } }}>
          {/* Left: Wine Image - Smaller Size */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: { xs: 2, md: 3 },
                overflow: 'hidden',
                boxShadow: theme.customShadows.z8,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                position: 'relative',
              }}
            >
              <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                {wineData.imageUrl ? (
                  <Image
                    src={wineData.imageUrl}
                    alt={wineData.wineName}
                    ratio="1/1"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      width: 1,
                      height: 1,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 1,
                      height: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.grey[500], 0.08),
                    }}
                  >
                    {icon('ic_wine')}
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Right: Wine Information */}
          <Grid item xs={12} md={8}>
            <Stack spacing={{ xs: 2, md: 3 }}>
              {/* Wine Name - Editable */}
              <EditableField
                label="Wine Name"
                value={wineData.wineName}
                type="text"
                canEdit={canEdit}
                isEditing={editingField === 'wineName'}
                onEdit={() => handleFieldEdit('wineName')}
                onSave={(value) => handleFieldSave('wineName', value as string)}
                onCancel={handleFieldCancel}
                placeholder="Enter wine name"
              />

              {/* Producer + Vintage - Editable */}
              <Card
                sx={{
                  p: 2.5,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                }}
              >
                <Stack spacing={1.5}>
                  {/* Producer */}
                  <EditableField
                    label="Producer"
                    value={wineData.producer || ''}
                    type="text"
                    canEdit={canEdit}
                    isEditing={editingField === 'producer'}
                    onEdit={() => handleFieldEdit('producer')}
                    onSave={(value) => handleFieldSave('producer', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter producer name"
                  />

                  {/* Vintage */}
                  <EditableField
                    label="Vintage"
                    value={String(wineData.vintage || '')}
                    type="number"
                    canEdit={canEdit}
                    isEditing={editingField === 'vintage'}
                    onEdit={() => handleFieldEdit('vintage')}
                    onSave={(value) => handleFieldSave('vintage', value as string)}
                    onCancel={handleFieldCancel}
                    placeholder="Enter vintage year"
                  />
                </Stack>
              </Card>

              {/* Wine Classification Cards */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card
                    sx={{
                      p: 2,
                      height: '100%',
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Wine Type
                      </Typography>
                       <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {wineData.wineType}
                        </Typography>
                    </Stack>
                  </Card>
                </Grid>

                {wineData.wineProfile && (
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        height: '100%',
                        bgcolor: alpha(theme.palette.info.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Profile
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {wineData.wineProfile}
                        </Typography>
                      </Stack>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Card
                    sx={{
                      p: 2,
                      height: '100%',
                      bgcolor: alpha(theme.palette.secondary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`,
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Region / Country
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center' }}>
                          {icon('ic_location')}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {wineData.region}, {wineData.country}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>

                {/* <Grid item xs={12} sm={6}>
                  <Card
                    sx={{
                      p: 2,
                      height: '100%',
                      bgcolor: alpha(
                        theme.palette[getStockStatusColor(wineData.stockStatus)].main,
                        0.04
                      ),
                      border: `1px solid ${alpha(
                        theme.palette[getStockStatusColor(wineData.stockStatus)].main,
                        0.12
                      )}`,
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Stock Status
                      </Typography>
                      <Label color={getStockStatusColor(wineData.stockStatus)}>
                        {getStockStatusLabel(wineData.stockStatus)}
                      </Label>
                    </Stack>
                  </Card>
                </Grid> */}
              </Grid>

              {/* Tags - Editable */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                    Tags
                  </Typography>
                </Stack>
                <EditableField
                  label="Tags"
                  value={wineData.tags || []}
                  type="tags"
                  canEdit={canEdit}
                  isEditing={editingField === 'tags'}
                  onEdit={() => handleFieldEdit('tags')}
                  onSave={(value) => handleFieldSave('tags', value as string[])}
                  onCancel={handleFieldCancel}
                  placeholder="Add tags separated by commas"
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Summary Cards */}
        <Box
          gap={3}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            md: 'repeat(3, 1fr)',
          }}
          sx={{ mb: { xs: 4, md: 6 } }}
        >
          <Card
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: alpha(theme.palette[summaryCard.color as 'success' | 'warning' | 'error'].main, 0.08),
              border: `1px solid ${alpha(
                theme.palette[summaryCard.color as 'success' | 'warning' | 'error'].main,
                0.16
              )}`,
            }}
          >
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                borderRadius: '50%',
                color: `${summaryCard.color}.main`,
                bgcolor: alpha(theme.palette[summaryCard.color as 'success' | 'warning' | 'error'].main, 0.08),
                mb: 2,
              }}
            >
              <Iconify icon={summaryCard.icon} width={36} />
            </Stack>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {summaryCard.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>{summaryCard.description}</Typography>
          </Card>

          <Card
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
            }}
          >
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                borderRadius: '50%',
                color: 'info.main',
                bgcolor: alpha(theme.palette.info.main, 0.08),
                mb: 2,
              }}
            >
              <Box sx={{ color: 'info.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SvgColor src="/assets/icons/navbar/ic_wine.svg" sx={{ width: 36, height: 36 }} />
              </Box>
            </Stack>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {wineData.totalStock}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>Total Bottles</Typography>
          </Card>
        </Box>

        {/* Description - Editable */}
        {wineData.description && (
          <Card sx={{ p: { xs: 2.5, sm: 3, md: 4 }, mb: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Description
                </Typography>
              </Stack>
              <EditableField
                label="Description"
                value={wineData.description}
                type="multiline"
                canEdit={canEdit}
                isEditing={editingField === 'description'}
                onEdit={() => handleFieldEdit('description')}
                onSave={(value) => handleFieldSave('description', value as string)}
                onCancel={handleFieldCancel}
                placeholder="Enter description"
              />
            </Stack>
          </Card>
        )}

        {/* Inventory & Stock Information */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
          {/* Inventory Breakdown */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                title="Inventory Breakdown"
                avatar={<Iconify icon="eva:list-outline" width={24} />}
                sx={{
                  '& .MuiCardHeader-title': {
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    fontWeight: 600,
                  },
                }}
              />
              <Divider />
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                        Bottle Size
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                      >
                        Quantity
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {BOTTLE_SIZES.map((size) => {
                      const quantity = wineData.inventory[size.key as keyof typeof wineData.inventory] || 0;
                      return (
                        <TableRow key={size.key} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                                {icon('ic_wine')}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {size.label}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {size.size}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {quantity}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Card>
          </Grid>

          {/* Stock Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: { xs: 2.5, sm: 3, md: 3 }, height: '100%' }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Iconify icon="eva:bar-chart-outline" width={24} />
                  <Typography
                    variant="h6"
                    sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 600 }}
                  >
                    Stock Summary
                  </Typography>
                </Stack>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Total Bottles
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 700, color: 'primary.main' }}>
                    {wineData.totalStock}
                  </Typography>
                </Box>
                <Divider />
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Iconify icon="mdi:arrow-down" width={16} sx={{ color: 'warning.main' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Minimum Level
                      </Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {wineData.minStockLevel}
                    </Typography>
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Iconify icon="mdi:arrow-up" width={16} sx={{ color: 'success.main' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Maximum Level
                      </Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {wineData.maxStockLevel}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* AI Pairing Ideas */}
        {/* <Card sx={{ p: { xs: 2.5, sm: 3, md: 4 }, mb: { xs: 3, md: 4 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Iconify icon="eva:flash-outline" width={24} />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 600 }}
            >
              AI Pairing Ideas
            </Typography>
            <Chip label="Read Only" size="small" color="info" variant="outlined" />
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {Object.entries(MOCK_AI_PAIRINGS).map(([category, items]) => (
              <Grid item xs={12} md={4} key={category}>
                <Card
                  sx={{
                    p: 2.5,
                    height: '100%',
                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: 'text.primary', fontWeight: 600, textTransform: 'capitalize' }}
                    >
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <Stack spacing={1}>
                      {items.map((item, index) => (
                        <Stack key={index} direction="row" spacing={1} alignItems="center">
                          <Iconify icon="mdi:check-circle" width={16} sx={{ color: 'success.main' }} />
                          <Typography variant="body2">{item}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card> */}

        {/* Business Information */}
        <Card sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Box sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}>
              {icon('ic_location')}
            </Box>
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 600 }}
            >
              Business Information
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {wineData.supplierName && (
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.info.main, 0.04),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <Iconify icon="eva:car-outline" width={20} sx={{ color: 'info.main' }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Supplier
                    </Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {wineData.supplierName}
                  </Typography>
                </Card>
              </Grid>
            )}

            {/* <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 2.5,
                  bgcolor: alpha(theme.palette.secondary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center' }}>
                    {icon('ic_location')}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Restaurant Location
                  </Typography>
                </Stack>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {wineData.location}
                </Typography>
              </Card>
            </Grid> */}
          </Grid>
        </Card>
      </Container>

      {/* 3-Dot Menu Popover */}
      <MenuPopover
        open={openPopover}
        onClose={() => setOpenPopover(null)}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            navigate(PATH_DASHBOARD.wineInventory.edit(id!));
            setOpenPopover(null);
          }}
        >
          <Iconify icon="eva:edit-fill" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenDeleteConfirm(true);
            setOpenPopover(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Delete
        </MenuItem>
      </MenuPopover>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Delete Wine"
        content={
          <>
            Are you sure you want to delete <strong>{wineData.wineName}</strong>? This action cannot be
            undone.
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteWine}
            sx={{
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
