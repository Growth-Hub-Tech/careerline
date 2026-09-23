import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';

// 1. The rules for the form. Zod checks each field and gives back the message
//    you see under the input when something is wrong.
const recruiterSignUpSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').min(2, 'Please enter your full name'),
  workEmail: z.string().min(1, 'Work email is required').email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(1, 'Company name is required'),
});

// 2. TypeScript type built straight from the rules above, so the two can never
//    drift apart.
type RecruiterSignUpFormValues = z.infer<typeof recruiterSignUpSchema>;

// Repeated input styles live in one place so all four inputs stay identical.
// Spec: 440 x 42, 6px radius, 1px border.
// border-[1px] + border-solid are both spelled out on purpose: Tailwind's
// `border` class only sets the WIDTH, and the style comes from Preflight. If
// Preflight is off, or a global stylesheet resets `input { border: none }`,
// the border silently disappears. This survives both.
const inputClasses =
  'h-[42px] w-full max-w-[440px] rounded-[6px] border-[1px] border-solid border-[#d9dbe3] bg-white px-3 text-sm text-[#1a1a2e] ' +
  'placeholder:text-[#9aa0ab] transition-colors focus:border-[#4a3f8c] focus:outline-none';

const labelClasses = 'mb-2 block text-xs font-semibold text-[#1f2a44]';
const errorClasses = 'mt-1.5 block text-xs text-[#d9534f]';

export const SignUp = () => {
  const navigate = useNavigate();

  // 3. react-hook-form keeps track of the values, the errors, and whether the
  //    form is currently being submitted.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecruiterSignUpFormValues>({
    resolver: zodResolver(recruiterSignUpSchema),
  });

  // 4. This only runs when every field passes the rules in the schema.
  const onSubmit = async (values: RecruiterSignUpFormValues) => {
    // TODO: wire up to the recruiter create-account endpoint
    console.log(values);
    navigate('/recruiter');
  };

  return (
    // Page: grey background, with the card sitting white on top of it
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f1f2f6] px-4 py-16">
      {/* Heading and subtitle sit ABOVE the card */}
      <h1 className="text-center text-[28px] font-bold text-[#1f2a44]">
        Create your recruiter account
      </h1>
      <p className="mt-2 text-center text-sm text-[#6b7280]">
        Verify a candidate&apos;s real skill level before you extend an offer.
      </p>

      {/* The white card. 504 = 440 input + 32 padding on each side. */}
      <div className="mt-8 w-[504px] max-w-full rounded-xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Full name */}
          <div className="mb-4">
            <label htmlFor="fullName" className={labelClasses}>
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Your full name"
              className={inputClasses}
              {...register('fullName')}
            />
            {errors.fullName && <span className={errorClasses}>{errors.fullName.message}</span>}
          </div>

          {/* Work email address */}
          <div className="mb-4">
            <label htmlFor="workEmail" className={labelClasses}>
              Work email address
            </label>
            <input
              id="workEmail"
              type="email"
              placeholder="you@yourcompany.com"
              className={inputClasses}
              {...register('workEmail')}
            />
            {errors.workEmail && <span className={errorClasses}>{errors.workEmail.message}</span>}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className={labelClasses}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className={inputClasses}
              {...register('password')}
            />
            {errors.password && <span className={errorClasses}>{errors.password.message}</span>}
          </div>

          {/* Company name */}
          <div className="mb-4">
            <label htmlFor="companyName" className={labelClasses}>
              Company name
            </label>
            <input
              id="companyName"
              type="text"
              placeholder="The company you are hiring for"
              className={inputClasses}
              {...register('companyName')}
            />
            {errors.companyName && (
              <span className={errorClasses}>{errors.companyName.message}</span>
            )}
          </div>

          {/* Submit button — purple for the recruiter flow */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 h-11 w-full max-w-[440px] rounded-lg bg-[#4a3f8c] text-sm font-semibold text-white transition-colors hover:bg-[#3e3576] focus-visible:ring-2 focus-visible:ring-[#4a3f8c] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Create recruiter account'}
          </button>
        </form>

        {/* Footer line inside the card */}
        <p className="mt-5 text-center text-xs text-[#6b7280]">
          Already have an account?{' '}
          <Link to="/sign-in" className="font-medium text-[#4a3f8c] hover:underline">
            Sign in instead.
          </Link>
        </p>
      </div>
    </div>
  );
};
