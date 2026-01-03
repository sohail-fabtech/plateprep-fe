import * as Yup from 'yup';

// ----------------------------------------------------------------------

const RoleValidationSchema = Yup.object().shape({
  role_name: Yup.string()
    .required('Role name is required')
    .min(2, 'Role name must be at least 2 characters')
    .max(100, 'Role name must be no more than 100 characters')
    .trim(),
  description: Yup.string()
    .required('Description is required')
    .min(1, 'Description is required')
    .trim(),
  permission_ids: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one permission must be selected')
    .required('At least one permission must be selected'),
});

export default RoleValidationSchema;

