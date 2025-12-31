import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export default function HowToGuidesPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> How To Guides | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          How To Guides
        </Typography>

        <Typography variant="body1">
          Help guides and tutorials will appear here. This is a placeholder page.
        </Typography>
      </Container>
    </>
  );
}

