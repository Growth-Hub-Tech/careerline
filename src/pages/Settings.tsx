import { useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { QueryState } from '../components/PageState';
import { StatusLabel } from '../components/StatusLabel';
import { TextField } from '../components/TextField';
import type { Account } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import {
  useAccount,
  useChangePassword,
  useResendVerification,
  useUpdateAccount,
} from '../lib/api/queries';
import { useSignOutEverywhere } from '../lib/user';
import { fullName, newPassword, phone } from '../lib/validation/auth';

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
  fullName: fullName.min(1, 'Enter your name'),
  phone,
});

type DetailsValues = z.infer<typeof detailsSchema>;

const EmailStatus = ({ account }: { account: Account }) => {
  const resend = useResendVerification();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] font-medium text-slate-800">Email</p>
      <p className="flex flex-wrap items-center gap-3 text-[16px] text-slate-900">
        {account.email}
        <StatusLabel status={account.email_verified ? 'success' : 'warning'}>
          {account.email_verified ? 'Confirmed' : 'Not confirmed yet'}
        </StatusLabel>
      </p>
      {!account.email_verified && !resend.isSuccess && (
        <Button
          variant="transparent"
          border="solid"
          fullWidth={false}
          className="self-start"
          isLoading={resend.isPending}
          onClick={() => resend.mutate()}
        >
          Send a new link
        </Button>
      )}
      {resend.isSuccess && <Alert variant="success">We sent a new link to {account.email}.</Alert>}
      {resend.isError && <Alert variant="error">{describeError(resend.error)}</Alert>}
    </div>
  );
};

// A saved name shows everywhere at once: the account in the cache is replaced, and the signed-in
// user follows it
const Details = ({ account }: { account: Account }) => {
  const updateAccount = useUpdateAccount();
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
      await updateAccount.mutateAsync({
        full_name: values.fullName.trim(),
        phone: values.phone.trim() || null,
      });
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
    next: newPassword,
    repeat: z.string(),
  })
  .refine((values) => values.next === values.repeat, {
    message: 'The passwords do not match',
    path: ['repeat'],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

const ChangePassword = () => {
  const changePassword = useChangePassword();
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
      await changePassword.mutateAsync({
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
  const signOutEverywhere = useSignOutEverywhere();

  return (
    <Card title="Devices">
      <p className="text-[15px] text-slate-600">
        Signed in on a shared or lost device? Sign out of every device, including this one.
      </p>
      {signOutEverywhere.isError && (
        <Alert variant="error">{describeError(signOutEverywhere.error)}</Alert>
      )}
      <Button
        variant="transparent"
        border="solid"
        fullWidth={false}
        className="self-start"
        isLoading={signOutEverywhere.isPending || signOutEverywhere.isSuccess}
        onClick={() => signOutEverywhere.mutate()}
      >
        Sign out everywhere
      </Button>
    </Card>
  );
};

export const Settings = () => {
  const account = useAccount();

  return (
    <div className="flex w-full max-w-[760px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Settings</h1>
        <p className="text-[15px] text-slate-600">Your account details and password.</p>
      </header>
      <QueryState query={account} loadingTitle="Loading your account">
        {(details) => (
          <>
            <Details account={details} />
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
        )}
      </QueryState>
    </div>
  );
};
