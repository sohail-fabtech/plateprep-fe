import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export default function SchedulingCalendarPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Scheduling Calendar | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Scheduling Calendar
        </Typography>

        <Typography variant="body1">
          Your scheduling calendar will appear here. This is a placeholder page.
        </Typography>
      </Container>
    </>
  );
}

