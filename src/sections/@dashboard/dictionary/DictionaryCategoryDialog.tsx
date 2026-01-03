import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { ProcessingDialog } from '../../../components/processing-dialog';
// validation
import DictionaryCategoryValidationSchema from './DictionaryCategoryValidation';
// services
import {
  useCreateDictionaryCategory,
  useUpdateDictionaryCategory,
  IDictionaryCategory,
  CreateDictionaryCategoryRequest,
  UpdateDictionaryCategoryRequest,
} from '../../../services';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  currentCategory?: IDictionaryCategory;
  onSuccess?: () => void;
};

// Consistent Form Styling System
const FORM_INPUT_SX = {
  '& .MuiInputBase-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiInputLabel-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiFormHelperText-root': {
    fontSize: { xs: '0.75rem', md: '0.75rem' },
  },
};

export default function DictionaryCategoryDialog({
  open,
  onClose,
  isEdit = false,
  currentCategory,
  onSuccess,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const createMutation = useCreateDictionaryCategory();
  const updateMutation = useUpdateDictionaryCategory();

  // Processing dialog state
  const [processingDialog, setProcessingDialog] = useState<{
    open: boolean;
    state: 'processing' | 'success' | 'error';
    message: string;
  }>({
    open: false,
    state: 'processing',
    message: '',
  });

  const defaultValues = useMemo(
    () => ({
      name: currentCategory?.name || '',
      description: currentCategory?.description || '',
    }),
    [currentCategory]
  );

  const methods = useForm({
    resolver: yupResolver(DictionaryCategoryValidationSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: { name: string; description: string | null }) => {
    try {
      setProcessingDialog({
        open: true,
        state: 'processing',
        message: isEdit ? 'Updating category...' : 'Creating category...',
      });

      const payload: CreateDictionaryCategoryRequest | UpdateDictionaryCategoryRequest = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
      };

      if (isEdit && currentCategory) {
        await updateMutation.mutateAsync({
          id: currentCategory.id,
          data: payload as UpdateDictionaryCategoryRequest,
        });
      } else {
        await createMutation.mutateAsync(payload as CreateDictionaryCategoryRequest);
      }

      setProcessingDialog({
        open: true,
        state: 'success',
        message: isEdit ? 'Category updated successfully!' : 'Category created successfully!',
      });

      setTimeout(() => {
        setProcessingDialog({ open: false, state: 'processing', message: '' });
        reset();
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error: any) {
      let errorMessage = 'Failed to save category. Please try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;

        // Handle field-specific errors
        if (errorData.name) {
          if (Array.isArray(errorData.name)) {
            errorMessage = errorData.name[0];
          } else if (typeof errorData.name === 'string') {
            errorMessage = errorData.name;
          }
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          if (Array.isArray(errorData.non_field_errors)) {
            errorMessage = errorData.non_field_errors[0];
          } else if (typeof errorData.non_field_errors === 'string') {
            errorMessage = errorData.non_field_errors;
          }
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setProcessingDialog({
        open: true,
        state: 'error',
        message: errorMessage,
      });

      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <ProcessingDialog
        open={processingDialog.open}
        state={processingDialog.state}
        message={processingDialog.message}
        onClose={() => setProcessingDialog({ open: false, state: 'processing', message: '' })}
      />

      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>

          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <RHFTextField
                name="name"
                label="Category Name"
                placeholder="Enter category name"
                sx={FORM_INPUT_SX}
              />

              <RHFTextField
                name="description"
                label="Description"
                placeholder="Enter category description (optional)"
                multiline
                rows={4}
                sx={FORM_INPUT_SX}
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {isEdit ? 'Update' : 'Create'}
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </>
  );
}

