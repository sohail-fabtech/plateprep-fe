import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export default function TrackingAnalyticsPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Tracking Analytics | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Tracking Analytics
        </Typography>

        <Typography variant="body1">
          Your tracking analytics dashboard will appear here. This is a placeholder page.
        </Typography>
      </Container>
    </>
  );
}

