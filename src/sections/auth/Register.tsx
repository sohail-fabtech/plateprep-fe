import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Stack, Typography, Link } from '@mui/material';
// layouts
import LoginLayout from '../../layouts/login';
// routes
import { PATH_AUTH } from '../../routes/paths';
//
import AuthWithSocial from './AuthWithSocial';
import AuthRegisterForm from './AuthRegisterForm';

// ----------------------------------------------------------------------

export default function Register() {
  return (
    <LoginLayout
      title="Start your restaurant journey"
      subtitle="Join thousands of restaurants managing their operations with PlatePrep"
      benefits={[
        'Customize your restaurant management system',
        'Scale from single location to multiple locations',
        'Access powerful tools and analytics',
      ]}
      illustration="/assets/images/auth/login.jpg"
    >
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography 
          variant="h4"
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            fontWeight: 700,
          }}
        >
          Get started absolutely free
        </Typography>

        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2">Already have an account?</Typography>

          <Link to={PATH_AUTH.login} component={RouterLink} variant="subtitle2">
            Sign in
          </Link>
        </Stack>
      </Stack>

      <AuthRegisterForm />

      <Typography
        component="div"
        sx={{ color: 'text.secondary', mt: 3, typography: 'caption', textAlign: 'center' }}
      >
        {'By signing up, I agree to '}
        <Link underline="always" color="text.primary">
          Terms of Service
        </Link>
        {' and '}
        <Link underline="always" color="text.primary">
          Privacy Policy
        </Link>
        .
      </Typography>

      <AuthWithSocial />
    </LoginLayout>
  );
}
