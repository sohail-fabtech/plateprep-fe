import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography, Button } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

export default function RestaurantLocationListPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Restaurant Locations | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Restaurant Locations
        </Typography>

        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:pin-fill" />}
          sx={{ mb: 5 }}
        >
          Add Location
        </Button>

        <Typography variant="body1">
          Your restaurant locations list will appear here. This is a placeholder page.
        </Typography>
      </Container>
    </>
  );
}

