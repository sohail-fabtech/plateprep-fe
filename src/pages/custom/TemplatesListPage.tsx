import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography, Button } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

export default function TemplatesListPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Templates | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Templates
        </Typography>

        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          sx={{ mb: 5 }}
        >
          New Template
        </Button>

        <Typography variant="body1">
          Your templates list will appear here. This is a placeholder page.
        </Typography>
      </Container>
    </>
  );
}

