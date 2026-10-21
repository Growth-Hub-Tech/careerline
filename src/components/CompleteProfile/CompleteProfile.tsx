import { useNavigate } from 'react-router-dom';
import { AUTH_PATHS, AuthTitle, SplitAuthLayout, TextField } from '../Auth';
import { Button } from '../Button';

export const CompleteProfile = ({ email = '' }: { email?: string }) => {
  const navigate = useNavigate();

  return (
    <SplitAuthLayout>
      <AuthTitle>Welcome to Careerline</AuthTitle>

      <div className="mt-10 flex flex-col">
        <div className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            defaultValue={email}
            placeholder="example@email.com"
            readOnly
          />
          <TextField label="Full name" autoComplete="name" placeholder="Enter your full name" />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
          />
          <TextField
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
          />
        </div>

        <Button
          fullWidth={false}
          className="mt-8 self-start"
          onClick={() => navigate(AUTH_PATHS.getStarted)}
        >
          Continue
        </Button>
      </div>
    </SplitAuthLayout>
  );
};
