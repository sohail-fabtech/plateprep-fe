import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export default function WineInventoryAddPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Add Wine | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Add Wine to Inventory
        </Typography>

        <Typography variant="body1">
          Wine addition form will appear here. This is a placeholder page.
        </Typography>
      </Container>
    </>
  );
}

