import { useState } from 'react';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_AUTH } from '../../routes/paths';
// utils
import axios from '../../utils/axios';
import { parseForgotPasswordConfirmError } from '../../utils/forgotPasswordConfirmErrorHandler';
// components
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  password: string;
  confirmPassword: string;
  afterSubmit?: string;
};

export default function AuthForgotPasswordConfirmForm() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id, token } = useParams<{ id: string; token: string }>();
  const [showPassword, setShowPassword] = useState(false);

  const ForgotPasswordConfirmSchema = Yup.object().shape({
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ForgotPasswordConfirmSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const {
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    if (!id || !token) {
      setError('afterSubmit', {
        type: 'manual',
        message: 'Invalid reset link. Please request a new password reset.',
      });
      return;
    }

    try {
      await axios.post('/forget-password-confirm/', {
        id,
        token,
        new_password: data.password,
      });
      enqueueSnackbar('Password reset successful! Please login with your new password.', {
        variant: 'success',
      });
      navigate(PATH_AUTH.login);
    } catch (error: any) {
      console.error(error);
      const parsedError = parseForgotPasswordConfirmError(error);

      // Set field-specific errors
      if (parsedError.new_password) {
        setError('password', {
          type: 'manual',
          message: parsedError.new_password,
        });
      }

      if (parsedError.id || parsedError.token) {
        setError('afterSubmit', {
          type: 'manual',
          message: parsedError.id || parsedError.token || 'Invalid reset link. Please request a new password reset.',
        });
      }

      // Set general error
      if (parsedError.general) {
        setError('afterSubmit', {
          type: 'manual',
          message: parsedError.general,
        });
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField
          name="password"
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="confirmPassword"
          label="Confirm New Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          Reset Password
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

