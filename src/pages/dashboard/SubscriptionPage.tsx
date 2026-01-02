import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

export default function SubscriptionPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Subscription | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Subscription"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Subscription',
            },
          ]}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Iconify
                icon="eva:credit-card-outline"
                width={64}
                sx={{ color: 'primary.main', mb: 2 }}
              />
              <Typography variant="h4" gutterBottom>
                Select a Subscription Plan
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                Please select a subscription plan to continue using the application. Your restaurant
                needs an active subscription to access all features.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  );
}

