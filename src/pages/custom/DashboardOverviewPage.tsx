import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography, Grid, Card, CardContent } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export default function DashboardOverviewPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Dashboard | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Dashboard Overview
        </Typography>

        <Typography variant="body1" sx={{ mb: 5 }}>
          Welcome to your dashboard. This is where you&apos;ll see an overview of all your activities.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Recipes</Typography>
                <Typography variant="h3">124</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Wine Inventory</Typography>
                <Typography variant="h3">856</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Active Tasks</Typography>
                <Typography variant="h3">23</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

