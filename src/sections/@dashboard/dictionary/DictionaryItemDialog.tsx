import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  MenuItem,
} from '@mui/material';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import { ProcessingDialog } from '../../../components/processing-dialog';
// validation
import DictionaryItemValidationSchema from './DictionaryItemValidation';
// services
import {
  useCreateDictionaryItem,
  useUpdateDictionaryItem,
  useDictionaryCategories,
  IDictionaryItem,
  IDictionaryCategory,
} from '../../../services';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  currentItem?: IDictionaryItem;
  categoryId?: number; // Pre-select category when adding from category page
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

export default function DictionaryItemDialog({
  open,
  onClose,
  isEdit = false,
  currentItem,
  categoryId,
  onSuccess,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const createMutation = useCreateDictionaryItem();
  const updateMutation = useUpdateDictionaryItem();

  // Fetch categories for dropdown
  const { data: categoriesData } = useDictionaryCategories({ page_size: 1000 });

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
      term: currentItem?.term || '',
      category: currentItem?.category?.id || categoryId || '',
      definition: currentItem?.definition || '',
      description: currentItem?.description || '',
    }),
    [currentItem, categoryId]
  );

  const methods = useForm({
    resolver: yupResolver(DictionaryItemValidationSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: {
    term: string;
    category: string | number;
    definition: string;
    description: string;
  }) => {
    try {
      setProcessingDialog({
        open: true,
        state: 'processing',
        message: isEdit ? 'Updating term...' : 'Creating term...',
      });

      const payload: any = {
        term: data.term.trim(),
        category: Number(data.category),
        definition: data.definition?.trim() || null,
        description: data.description?.trim() || null,
      };

      if (isEdit && currentItem) {
        await updateMutation.mutateAsync({
          id: currentItem.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setProcessingDialog({
        open: true,
        state: 'success',
        message: isEdit ? 'Term updated successfully!' : 'Term created successfully!',
      });

      setTimeout(() => {
        setProcessingDialog({ open: false, state: 'processing', message: '' });
        reset();
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error: any) {
      let errorMessage = 'Failed to save term. Please try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;

        // Handle field-specific errors
        if (errorData.term) {
          if (Array.isArray(errorData.term)) {
            errorMessage = errorData.term[0];
          } else if (typeof errorData.term === 'string') {
            errorMessage = errorData.term;
          }
        } else if (errorData.category) {
          if (Array.isArray(errorData.category)) {
            errorMessage = errorData.category[0];
          } else if (typeof errorData.category === 'string') {
            errorMessage = errorData.category;
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

  const categories: IDictionaryCategory[] = categoriesData?.results || [];

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
          <DialogTitle>{isEdit ? 'Edit Term' : 'Add Term'}</DialogTitle>

          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <RHFSelect
                name="category"
                label="Category"
                placeholder="Select category"
                disabled={!!categoryId && !isEdit} // Disable if categoryId is provided and not editing
                sx={FORM_INPUT_SX}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFTextField
                name="term"
                label="Term"
                placeholder="Enter term"
                sx={FORM_INPUT_SX}
              />

              <RHFTextField
                name="definition"
                label="Definition"
                placeholder="Enter definition (optional)"
                multiline
                rows={3}
                sx={FORM_INPUT_SX}
              />

              <RHFTextField
                name="description"
                label="Description"
                placeholder="Enter description (optional)"
                multiline
                rows={3}
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

