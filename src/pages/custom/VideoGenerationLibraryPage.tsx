import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export default function VideoGenerationLibraryPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Video Library | Plateprep</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Video Library
        </Typography>

        <Typography variant="body1">
          Your generated videos library will appear here. This is a placeholder page.
        </Typography>
      </Container>
    </>
  );
}

