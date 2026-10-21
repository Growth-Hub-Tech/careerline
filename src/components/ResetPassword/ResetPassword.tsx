import { AUTH_PATHS, AuthText, AuthTitle, CardAuthLayout, DashedLink, TextField } from '../Auth';
import { Button } from '../Button';

export const ResetPassword = () => (
  <CardAuthLayout showActions>
    <AuthTitle>Reset your password</AuthTitle>

    <AuthText className="mt-6">
      Enter the email address on your account and we will send you a link to reset your password.
    </AuthText>

    <div className="mt-8 flex flex-col gap-6">
      <TextField label="Email" type="email" autoComplete="email" placeholder="Enter your email" />
      <Button variant="secondary">Send reset link</Button>
    </div>

    <div className="mt-8">
      <DashedLink to={AUTH_PATHS.signIn}>Sign in instead</DashedLink>
    </div>
  </CardAuthLayout>
);
