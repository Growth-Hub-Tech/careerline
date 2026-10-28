import { useState } from 'react';
import { authApi } from '../../lib/api';
import { describeError } from '../../lib/api/describeError';
import { Alert } from '../Alert';
import { Button } from '../Button';

interface ResendEmailProps {
  readonly label: string;
  readonly sentMessage: string;
}

export const ResendEmail = ({ label, sentMessage }: ResendEmailProps) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string>();

  const send = async () => {
    setError(undefined);
    setIsSent(false);
    setIsSending(true);

    try {
      await authApi.resendVerification();
      setIsSent(true);
    } catch (failure) {
      setError(describeError(failure));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert variant="error">{error}</Alert>}
      {isSent && <Alert variant="success">{sentMessage}</Alert>}
      <Button variant="secondary" isLoading={isSending} onClick={send}>
        {label}
      </Button>
    </div>
  );
};
