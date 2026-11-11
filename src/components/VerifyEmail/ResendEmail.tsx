import { useResendVerification } from '../../lib/api/queries';
import { describeError } from '../../lib/api/describeError';
import { Alert } from '../Alert';
import { Button } from '../Button';

interface ResendEmailProps {
  readonly label: string;
  readonly sentMessage: string;
}

export const ResendEmail = ({ label, sentMessage }: ResendEmailProps) => {
  const resend = useResendVerification();

  return (
    <div className="flex flex-col gap-3">
      {resend.isError && <Alert variant="error">{describeError(resend.error)}</Alert>}
      {resend.isSuccess && <Alert variant="success">{sentMessage}</Alert>}
      <Button variant="secondary" isLoading={resend.isPending} onClick={() => resend.mutate()}>
        {label}
      </Button>
    </div>
  );
};
