import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography, Button } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

export default function TasksListPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Tasks | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Tasks
        </Typography>

        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          sx={{ mb: 5 }}
        >
          New Task
        </Button>

        <Typography variant="body1">
          Your tasks list will appear here. This is a placeholder page.
        </Typography>
      </Container>
    </>
  );
}

