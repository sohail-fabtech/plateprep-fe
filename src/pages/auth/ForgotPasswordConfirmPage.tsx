import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
// sections
import AuthForgotPasswordConfirmForm from '../../sections/auth/AuthForgotPasswordConfirmForm';
// assets
import { PasswordIcon } from '../../assets/icons';

// ----------------------------------------------------------------------

export default function ForgotPasswordConfirmPage() {
  return (
    <>
      <Helmet>
        <title> Reset Password | Minimal UI</title>
      </Helmet>

      <PasswordIcon sx={{ mb: 5, height: 96 }} />

      <Typography variant="h3" paragraph>
        Reset Your Password
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
        Please enter your new password below.
      </Typography>

      <AuthForgotPasswordConfirmForm />

      <Link
        component={RouterLink}
        to={PATH_AUTH.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          mt: 3,
          mx: 'auto',
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:chevron-left-fill" width={16} />
        Return to sign in
      </Link>
    </>
  );
}

