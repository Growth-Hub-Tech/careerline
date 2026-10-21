import { Link } from 'react-router-dom';
import { AUTH_PATHS, AuthTitle, DashedLink, SplitAuthLayout, TextField } from '../Auth';
import { Button } from '../Button';

export const SignIn = () => (
  <SplitAuthLayout>
    <AuthTitle>Welcome Back</AuthTitle>
    <p className="mt-3 text-[16px] text-slate-700">Welcome back! Please enter your details.</p>

    <div className="mt-10 flex flex-col">
      <div className="flex flex-col gap-5">
        <TextField label="Email" type="email" autoComplete="email" placeholder="Enter your email" />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-[14px] font-medium text-slate-700">
          <input
            type="checkbox"
            className="size-4 cursor-pointer rounded border-slate-300 accent-indigo-600"
          />
          Remember me
        </label>
        <Link
          to={AUTH_PATHS.forgotPassword}
          className="rounded text-[14px] font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Forgot password
        </Link>
      </div>

      <Button className="mt-6">Sign in</Button>
    </div>

    <div className="mt-10 text-center">
      <DashedLink to={AUTH_PATHS.signUp}>Create your account instead</DashedLink>
    </div>
  </SplitAuthLayout>
);
