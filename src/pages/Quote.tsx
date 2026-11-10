import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { TextField } from '../components/TextField';
import { contactApi, type ContactReceipt } from '../lib/api';
import { describeError } from '../lib/api/describeError';

const TEAM_SIZES = ['1-50', '51-200', '201-1000', '1000+'].map((value) => ({
  value,
  label: `${value} people`,
}));

const quoteSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your name'),
  email: z.string().trim().email('Enter a valid work email'),
  organisation: z.string().trim().min(1, 'Enter your organisation'),
  teamSize: z.string(),
  needs: z.string().trim().min(10, 'Tell us what you need in at least 10 characters'),
});

type QuoteValues = z.infer<typeof quoteSchema>;

export const Quote = () => {
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState<{ email: string; receipt: ContactReceipt }>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { fullName: '', email: '', organisation: '', teamSize: '51-200', needs: '' },
  });

  const submit = handleSubmit(async (values) => {
    setError(undefined);
    try {
      const receipt = await contactApi.send({
        full_name: values.fullName.trim(),
        email: values.email.trim(),
        topic: 'organisation_audit',
        organisation: values.organisation.trim(),
        message: `People to test: ${values.teamSize}\n\n${values.needs.trim()}`,
      });
      setSent({ email: values.email.trim(), receipt });
    } catch (sendError) {
      setError(describeError(sendError));
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-12 sm:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-[32px] leading-[1.2] font-bold text-slate-950">
          Request an enterprise quote
        </h1>
        <p className="text-[15px] text-slate-600">
          For larger teams, your own role standards or a link with your HR system. Tell us what you
          need and we will send you a price.
        </p>
      </header>

      {sent ? (
        <Alert variant="success">
          <span className="flex flex-col gap-1">
            <span>Thank you. We will reply to {sent.email} with a quote.</span>
            <span>Your reference is {sent.receipt.ticket_id}.</span>
          </span>
        </Alert>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {error && <Alert variant="error">{error}</Alert>}
          <TextField label="Full name" error={errors.fullName?.message} {...register('fullName')} />
          <TextField
            label="Work email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Organisation"
            autoComplete="organization"
            error={errors.organisation?.message}
            {...register('organisation')}
          />
          <Select label="People to test" options={TEAM_SIZES} {...register('teamSize')} />
          <Textarea
            label="What do you need?"
            rows={5}
            error={errors.needs?.message}
            {...register('needs')}
          />
          <Button type="submit" fullWidth={false} className="self-start" isLoading={isSubmitting}>
            Request a quote
          </Button>
        </form>
      )}
    </div>
  );
};
