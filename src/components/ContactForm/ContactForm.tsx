import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { contactApi, type ContactReceipt, type ContactRequest } from '../../lib/api';
import { describeError } from '../../lib/api/describeError';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { TextField } from '../TextField';
import { Textarea } from '../Textarea';

const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters'),
  privacy: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the privacy policy',
  }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  readonly onSubmit?: (message: ContactRequest) => Promise<ContactReceipt>;
}

const sendWithApi = (message: ContactRequest) => contactApi.send(message);

const ContactForm = ({ onSubmit = sendWithApi }: ContactFormProps) => {
  const [formError, setFormError] = useState<string>();
  const [receipt, setReceipt] = useState<ContactReceipt>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      message: '',
      privacy: false,
    },
  });

  const submit = handleSubmit(async (data) => {
    setFormError(undefined);
    setReceipt(undefined);

    try {
      const result = await onSubmit({
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        topic: 'general',
        message: data.message,
      });
      setReceipt(result);
      reset();
    } catch (error) {
      setFormError(describeError(error));
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {formError && <Alert variant="error">{formError}</Alert>}
      {receipt && (
        <Alert variant="success">
          Thanks, we have your message. Your reference is {receipt.ticket_id}.
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="First name"
          placeholder="First name"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <TextField
          label="Last name"
          placeholder="Last name"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <TextField
        label="Email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Textarea label="Message" error={errors.message?.message} {...register('message')} />

      <Checkbox
        label="You agree to our privacy policy."
        error={errors.privacy?.message}
        {...register('privacy')}
      />

      <Button type="submit" fullWidth={false} isLoading={isSubmitting} className="sm:self-start">
        {isSubmitting ? 'Sending...' : 'Send message'}
      </Button>
    </form>
  );
};

export default ContactForm;
