import { AUTH_PATHS, AuthText, AuthTitle, CardAuthLayout, DashedLink } from '../Auth';
import { Button } from '../Button';

export const VerifyEmail = ({ email = 'example@email.com' }: { email?: string }) => (
  <CardAuthLayout>
    <AuthTitle>Verify your email</AuthTitle>

    <AuthText className="mt-6">
      Kindly verify your email. You will receive a temporary link we sent to {email}. Please check
      your spam folder as well.
    </AuthText>

    <Button variant="secondary" className="mt-6">
      Resend Email
    </Button>

    <div className="mt-8 flex flex-col items-start gap-4">
      {/* TEMP: stands in for the link in the verification email. Remove once emails are sent. */}
      <DashedLink to={AUTH_PATHS.completeProfile}>I've verified my email</DashedLink>
      <DashedLink to={AUTH_PATHS.signUp}>Don't have an account, Sign Up</DashedLink>
    </div>
  </CardAuthLayout>
);
