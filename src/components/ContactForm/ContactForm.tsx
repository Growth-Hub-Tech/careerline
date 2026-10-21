import './ContactForm.scss';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  message: z.string().min(1, 'Message is required'),
  privacy: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the privacy policy',
  }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactForm = () => {
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

  const onSubmit = (_data: ContactFormData) => {
    // TODO: replace alert with a real API call using _data
    alert('Message sent successfully!');
    reset();
  };

  return (
    <div className="contact-form">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="row">
          <div className="field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              type="text"
              placeholder="First name"
              {...register('firstName')}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-message">{errors.firstName.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Last name"
              {...register('lastName')}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-message">{errors.lastName.message}</span>}
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register('email')}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            rows={5}
            {...register('message')}
            className={errors.message ? 'error' : ''}
          />
          {errors.message && <span className="error-message">{errors.message.message}</span>}
        </div>

        <div className="checkbox d-flex items-start gap-2 my-4">
          <input id="privacy" type="checkbox" {...register('privacy')} />
          <label htmlFor="privacy">You agree to our privacy policy.</label>
        </div>
        {errors.privacy && (
          <span className="error-message checkbox-error">{errors.privacy.message}</span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="p-3 rounded-lg font-medium cursor-pointer border-0"
        >
          {isSubmitting ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
