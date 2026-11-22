import { describeError } from '../../lib/api/describeError';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Dialog } from './Dialog';

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly confirmLabel: string;
  readonly cancelLabel?: string;
  readonly isPending?: boolean;
  readonly error?: unknown;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  isPending = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    footer={
      <>
        <Button
          variant="transparent"
          border="solid"
          fullWidth={false}
          disabled={isPending}
          onClick={onClose}
        >
          {cancelLabel}
        </Button>
        <Button fullWidth={false} isLoading={isPending} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    {error ? <Alert variant="error">{describeError(error)}</Alert> : null}
  </Dialog>
);
