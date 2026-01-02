import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Stack, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import axios from '../../utils/axios';
import { parseForgotPasswordError } from '../../utils/forgotPasswordErrorHandler';
// components
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  afterSubmit?: string;
};

export default function AuthResetPasswordForm() {
  const { enqueueSnackbar } = useSnackbar();

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    setError,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      await axios.post('/forget-password/', {
        email: data.email,
      });
      enqueueSnackbar('Password reset link has been sent to your email address', { variant: 'success' });
      reset();
    } catch (error: any) {
      console.error(error);
      const parsedError = parseForgotPasswordError(error);

      // Set field-specific errors
      if (parsedError.email) {
        setError('email', {
          type: 'manual',
          message: parsedError.email,
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

        <RHFTextField name="email" label="Email address" />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          Send Request
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
