import { useNavigate } from 'react-router-dom';
import { AUTH_PATHS, AuthTitle, DashedLink, SplitAuthLayout, TextField } from '../Auth';
import { Button } from '../Button';

export const SignUp = () => {
  const navigate = useNavigate();

  return (
    <SplitAuthLayout>
      <AuthTitle>Create your free account</AuthTitle>

      <div className="mt-10 flex flex-col gap-8">
        <TextField label="Email" type="email" autoComplete="email" placeholder="Enter your email" />
        <Button onClick={() => navigate(AUTH_PATHS.verifyEmail)}>Continue with email</Button>
      </div>

      <div className="mt-10">
        <DashedLink to={AUTH_PATHS.signIn}>Log in to an existing account</DashedLink>
      </div>
    </SplitAuthLayout>
  );
};
