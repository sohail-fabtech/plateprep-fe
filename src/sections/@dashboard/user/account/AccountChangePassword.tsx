import * as Yup from 'yup';
import { useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Stack, Card } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { IUserAccountChangePassword } from '../../../../@types/user';
// components
import Iconify from '../../../../components/iconify';
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../../components/hook-form';
import { ProcessingDialog } from '../../../../components/processing-dialog';
// services
import { useChangePassword } from '../../../../services';
// utils
import { parseUserError, getFieldErrors } from '../../../../utils/userErrorHandler';

// ----------------------------------------------------------------------

type FormValuesProps = IUserAccountChangePassword;

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();
  const changePasswordMutation = useChangePassword();

  const [processingDialog, setProcessingDialog] = useState<{
    open: boolean;
    state: 'processing' | 'success' | 'error';
    message: string;
  }>({
    open: false,
    state: 'processing',
    message: '',
  });

  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Old Password is required'),
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New Password is required'),
    confirmNewPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const defaultValues = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    setProcessingDialog({
      open: true,
      state: 'processing',
      message: 'Changing password...',
    });

    try {
      clearErrors();

      const apiPayload = {
        old_password: data.oldPassword.trim(),
        new_password: data.newPassword.trim(),
      };

      await changePasswordMutation.mutateAsync(apiPayload);

      setProcessingDialog({
        open: true,
        state: 'success',
        message: 'Password changed successfully!',
      });

      reset();

      setTimeout(() => {
        setProcessingDialog({ open: false, state: 'processing', message: '' });
      }, 1500);
    } catch (error: any) {
      console.error('Error changing password:', error);

      const parsedError = parseUserError(error);
      const fieldErrors = getFieldErrors(error);

      Object.keys(fieldErrors).forEach((fieldName) => {
        const errorMessage = fieldErrors[fieldName];
        // Map API field names to form field names
        const mappedFieldName =
          fieldName === 'old_password' ? 'oldPassword' : fieldName === 'new_password' ? 'newPassword' : fieldName;

        setError(mappedFieldName as any, {
          type: 'server',
          message: errorMessage,
        });
      });

      const errorMessage =
        parsedError?.general ||
        error?.message ||
        'Failed to change password. Please try again.';

      setProcessingDialog({
        open: true,
        state: 'error',
        message: errorMessage,
      });

      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <>
      <ProcessingDialog
        open={processingDialog.open}
        state={processingDialog.state}
        message={processingDialog.message}
        onClose={() => {
          if (processingDialog.state !== 'processing') {
            setProcessingDialog({ open: false, state: 'processing', message: '' });
          }
        }}
      />

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <Stack spacing={3} alignItems="flex-end" sx={{ p: 3 }}>
            <RHFTextField name="oldPassword" type="password" label="Old Password" />

            <RHFTextField
              name="newPassword"
              type="password"
              label="New Password"
              helperText={
                <Stack component="span" direction="row" alignItems="center">
                  <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} /> Password must be
                  minimum 6+
                </Stack>
              }
            />

            <RHFTextField name="confirmNewPassword" type="password" label="Confirm New Password" />

            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Save Changes
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </>
  );
}
