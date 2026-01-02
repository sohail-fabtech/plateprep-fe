// @mui
import { Dialog, Button, DialogTitle, DialogActions, DialogContent } from '@mui/material';
//
import { ConfirmDialogProps } from './types';

// ----------------------------------------------------------------------

export default function ConfirmDialog({
  title,
  content,
  action,
  open,
  onClose,
  cancelButtonDisabled = false,
  ...other
}: ConfirmDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={cancelButtonDisabled ? undefined : onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      {content && <DialogContent sx={{ typography: 'body2' }}> {content} </DialogContent>}

      <DialogActions>
        {action}

        <Button variant="outlined" color="inherit" onClick={onClose} disabled={cancelButtonDisabled}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
