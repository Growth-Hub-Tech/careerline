import { useId, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { StatusLabel } from '../components/StatusLabel';
import { TextField } from '../components/TextField';
import { accountsApi, authApi, type Account } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { useRequest } from '../lib/hooks/useRequest';
import { useSession } from '../lib/session';

const LINK = 'font-medium text-indigo-700 underline hover:text-indigo-900';

const Card = ({ title, children }: { title: string; children: ReactNode }) => {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 id={headingId} className="text-[20px] font-bold text-slate-800">
        {title}
      </h2>
      {children}
    </section>
  );
};

const detailsSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your name').max(120, 'Use 120 characters or fewer'),
  phone: z.string().trim().max(32, 'Use 32 characters or fewer'),
});

type DetailsValues = z.infer<typeof detailsSchema>;

const EmailStatus = ({ account }: { account: Account }) => {
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [isSending, setIsSending] = useState(false);

  const resend = async () => {
    setIsSending(true);
    setError(undefined);
    try {
      await authApi.resendVerification();
      setMessage(`We sent a new link to ${account.email}.`);
    } catch (sendError) {
      setError(describeError(sendError));
    }
    setIsSending(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] font-medium text-slate-800">Email</p>
      <p className="flex flex-wrap items-center gap-3 text-[16px] text-slate-900">
        {account.email}
        <StatusLabel status={account.email_verified ? 'success' : 'warning'}>
          {account.email_verified ? 'Confirmed' : 'Not confirmed yet'}
        </StatusLabel>
      </p>
      {!account.email_verified && !message && (
        <Button
          variant="transparent"
          border="solid"
          fullWidth={false}
          className="self-start"
          isLoading={isSending}
          onClick={resend}
        >
          Send a new link
        </Button>
      )}
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
};

const Details = ({ account }: { account: Account }) => {
  const { session, signIn } = useSession();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { fullName: account.full_name, phone: account.phone ?? '' },
  });

  const save = handleSubmit(async (values) => {
    setSaved(false);
    setError(undefined);
    try {
      const updated = await accountsApi.update({
        full_name: values.fullName.trim(),
        phone: values.phone.trim() || null,
      });
      if (session) signIn({ ...session, user: { ...session.user, name: updated.full_name } });
      setSaved(true);
    } catch (saveError) {
      setError(describeError(saveError));
    }
  });

  return (
    <Card title="Your details">
      <EmailStatus account={account} />
      <form onSubmit={save} noValidate className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}
        <TextField
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <TextField
          label="Phone"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        {saved && <Alert variant="success">Your details are saved.</Alert>}
        <Button type="submit" fullWidth={false} className="self-start" isLoading={isSubmitting}>
          Save details
        </Button>
      </form>
    </Card>
  );
};

const passwordSchema = z
  .object({
    current: z.string().min(1, 'Enter your current password'),
    next: z.string().min(8, 'Use at least 8 characters'),
    repeat: z.string(),
  })
  .refine((values) => values.next === values.repeat, {
    message: 'The passwords do not match',
    path: ['repeat'],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

const ChangePassword = () => {
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: '', next: '', repeat: '' },
  });

  const change = handleSubmit(async (values) => {
    setChanged(false);
    setError(undefined);
    try {
      await accountsApi.changePassword({
        current_password: values.current,
        new_password: values.next,
      });
      reset();
      setChanged(true);
    } catch (changeError) {
      if (changeError instanceof ApiError && changeError.code === 'wrong_password') {
        setFieldError('current', { message: 'That is not your current password' });
      } else {
        setError(describeError(changeError));
      }
    }
  });

  return (
    <Card title="Change password">
      <form onSubmit={change} noValidate className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}
        <TextField
          label="Current password"
          type="password"
          autoComplete="current-password"
          error={errors.current?.message}
          {...register('current')}
        />
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.next?.message}
          {...register('next')}
        />
        <TextField
          label="Repeat new password"
          type="password"
          autoComplete="new-password"
          error={errors.repeat?.message}
          {...register('repeat')}
        />
        {changed && (
          <Alert variant="success">
            Your password was changed. Your other devices were signed out.
          </Alert>
        )}
        <Button type="submit" fullWidth={false} className="self-start" isLoading={isSubmitting}>
          Change password
        </Button>
      </form>
    </Card>
  );
};

const SignOutEverywhere = () => {
  const navigate = useNavigate();
  const { signOut } = useSession();
  const [error, setError] = useState<string>();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOutEverywhere = async () => {
    setIsSigningOut(true);
    setError(undefined);
    try {
      await authApi.logout(true);
      signOut();
      navigate('/sign-in', { replace: true });
    } catch (signOutError) {
      setError(describeError(signOutError));
      setIsSigningOut(false);
    }
  };

  return (
    <Card title="Devices">
      <p className="text-[15px] text-slate-600">
        Signed in on a shared or lost device? Sign out of every device, including this one.
      </p>
      {error && <Alert variant="error">{error}</Alert>}
      <Button
        variant="transparent"
        border="solid"
        fullWidth={false}
        className="self-start"
        isLoading={isSigningOut}
        onClick={signOutEverywhere}
      >
        Sign out everywhere
      </Button>
    </Card>
  );
};

const load = () => accountsApi.me();

export const Settings = () => {
  const { state, retry } = useRequest(load);

  let content;
  if (state.status === 'loading') {
    content = <PageLoader title="Loading your account" className="flex-1" />;
  } else if (state.status === 'error') {
    content = <LoadFailed error={state.error} onRetry={retry} />;
  } else {
    content = (
      <>
        <Details account={state.data} />
        <ChangePassword />
        <SignOutEverywhere />
        <p className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          <Link to="/settings/privacy" className={LINK}>
            Privacy centre
          </Link>
          <Link to="/billing" className={LINK}>
            Billing
          </Link>
        </p>
      </>
    );
  }

  return (
    <div className="flex w-full max-w-[760px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Settings</h1>
        <p className="text-[15px] text-slate-600">Your account details and password.</p>
      </header>
      {content}
    </div>
  );
};
