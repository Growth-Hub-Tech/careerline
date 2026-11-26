import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert } from '../components/Alert';
import { Button, LINK_CLASS } from '../components/Button';
import { ConfirmDialog } from '../components/Dialog';
import { QueryState } from '../components/PageState';
import { TextField } from '../components/TextField';
import type { Account } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { useAccount, useChangePassword, useUpdateAccount } from '../lib/api/queries';
import { useSignOutEverywhere } from '../lib/user';
import { fullName, newPassword, phone } from '../lib/validation/auth';
import { Section } from '../components/Section';

const detailsSchema = z.object({
  fullName: fullName.min(1, 'Enter your name'),
  phone,
});

type DetailsValues = z.infer<typeof detailsSchema>;

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
    <Section title="Your details">
      <div className="flex flex-col gap-2">
        <p className="text-[14px] font-medium text-slate-800">Email</p>
        <p className="text-[16px] break-all text-slate-900">{account.email}</p>
      </div>
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
    </Section>
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
    <Section title="Change password">
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
    </Section>
  );
};

const SignOutEverywhere = () => {
  const signOutEverywhere = useSignOutEverywhere();
  const [isAsking, setIsAsking] = useState(false);

  return (
    <Section title="Devices">
      <p className="text-[15px] text-slate-600">
        Signed in on a shared or lost device? Sign out of every device, including this one.
      </p>
      <Button
        variant="transparent"
        border="solid"
        fullWidth={false}
        className="self-start"
        onClick={() => setIsAsking(true)}
      >
        Sign out everywhere
      </Button>
      <ConfirmDialog
        open={isAsking}
        title="Sign out of every device?"
        description="You will be signed out here too and need your password to sign in again."
        confirmLabel="Sign out everywhere"
        isPending={signOutEverywhere.isPending || signOutEverywhere.isSuccess}
        error={signOutEverywhere.error}
        onConfirm={() => signOutEverywhere.mutate()}
        onClose={() => setIsAsking(false)}
      />
    </Section>
  );
};

export const Settings = () => {
  const account = useAccount();

  return (
    <div className="flex w-full max-w-[760px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="page-title">Settings</h1>
        <p className="text-[15px] text-slate-600">Your account details and password.</p>
      </header>
      <QueryState query={account} loadingTitle="Loading your account">
        {(details) => (
          <>
            <Details account={details} />
            <ChangePassword />
            <SignOutEverywhere />
            <p className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
              <Link to="/settings/privacy" className={LINK_CLASS}>
                Privacy centre
              </Link>
              <Link to="/billing" className={LINK_CLASS}>
                Billing
              </Link>
            </p>
          </>
        )}
      </QueryState>
    </div>
  );
};
