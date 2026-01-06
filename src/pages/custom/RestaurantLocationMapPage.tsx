import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export default function RestaurantLocationMapPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Location Map | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Restaurant Location Map
        </Typography>

        <Typography variant="body1">
          Interactive map of restaurant locations will appear here. This is a placeholder page.
        </Typography>
      </Container>
    </>
  );
}

