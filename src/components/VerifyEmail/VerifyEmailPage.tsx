import { useSearchParams } from 'react-router-dom';
import { ConfirmEmail } from './ConfirmEmail';
import { VerifyEmail } from './VerifyEmail';

export const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');

  return token ? <ConfirmEmail token={token} /> : <VerifyEmail />;
};
