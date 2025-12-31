import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export default function SettingsGeneralPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> General Settings | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          General Settings
        </Typography>

        <Typography variant="body1">
          General application settings will appear here. This is a placeholder page.
        </Typography>
      </Container>
    </>
  );
}

