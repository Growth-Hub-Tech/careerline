import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';

// Length caps. These are mirrored onto the inputs as maxLength so the browser
// stops the typing, and enforced again in the schema so a paste or a tampered
// DOM can't get past them. The real cap still has to exist on the server.
const LIMITS = {
  organizationName: 100,
  workEmail: 254, // the maximum length of an email address per RFC 5321
  password: 128,
  staffCount: 40,
} as const;

// 1. The rules for the form. Zod checks each field and gives back the message
//    you see under the input when something is wrong.
//    .trim() and .toLowerCase() run BEFORE the checks below them, so a value
//    of "   " fails the min() and " You@Co.COM " arrives as "you@co.com".
const organizationSignUpSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(1, 'Organization name is required')
    .min(2, 'Please enter your organization name')
    .max(LIMITS.organizationName, 'Organization name is too long'),
  workEmail: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Work email is required')
    .max(LIMITS.workEmail, 'Email address is too long')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Use at least 8 characters')
    .max(LIMITS.password, 'Password is too long')
    .regex(/[a-z]/, 'Include a lowercase letter')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number'),
  // Kept as text, not a number, because the field accepts a rough range
  // ("50 to 100") rather than one exact figure. The regex is a whitelist:
  // digits and a few separators only, so nothing script-like can be typed in.
  staffCount: z
    .string()
    .trim()
    .min(1, 'Please tell us roughly how many staff')
    .max(LIMITS.staffCount, 'Keep this short')
    .regex(/^\d[\d\s,.\-to]*$/i, 'Use numbers, for example 50 to 100'),
});

// 2. TypeScript type built straight from the rules above, so the two can never
//    drift apart. Every field is a required string — there is no `any` here and
//    no field name that isn't in the schema.
type OrganizationSignUpFormValues = z.infer<typeof organizationSignUpSchema>;

// One message for every kind of failure. Saying "that email is already
// registered" would let anyone check which companies have accounts, so the
// server should answer the same way for a taken email as for a network fault,
// and the UI shows this either way.
const GENERIC_SUBMIT_ERROR = "We couldn't create your account. Check your details and try again.";

// Repeated input styles live in one place so all four inputs stay identical.
// Spec: 440 x 42, 6px radius, 1px border.
// border-[1px] + border-solid are both spelled out on purpose: Tailwind's
// `border` class only sets the WIDTH, and the style comes from Preflight. If
// Preflight is off, or a global stylesheet resets `input { border: none }`,
// the border silently disappears. This survives both.
const inputClasses =
  'h-[42px] w-full max-w-[440px] rounded-[6px] border-[1px] border-solid border-[#d9dbe3] bg-white px-3 text-sm text-[#1a1a2e] ' +
  'placeholder:text-[#9aa0ab] transition-colors focus:border-[#0f8a6a] focus:outline-none';

const labelClasses = 'mb-2 block text-xs font-semibold text-[#1f2a44]';
const errorClasses = 'mt-1.5 block text-xs text-[#d9534f]';

export const SignUp = () => {
  const navigate = useNavigate();

  // 3. react-hook-form keeps track of the values, the errors, and whether the
  //    form is currently being submitted.
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationSignUpFormValues>({
    resolver: zodResolver(organizationSignUpSchema),
    mode: 'onTouched',
  });

  // 4. This only runs when every field passes the rules in the schema.
  //    Note what is NOT here: no console.log of `values`. Logging the form
  //    object would print the password into the browser console, and anything
  //    that ships console output (Sentry, LogRocket, a support screen-share)
  //    would carry it with them.
  const onSubmit: SubmitHandler<OrganizationSignUpFormValues> = async (values) => {
    try {
      // TODO: replace with the real call. It must be a POST over HTTPS — never
      // a GET, or the password lands in the URL, then in browser history and
      // server access logs. The session should come back as an httpOnly,
      // Secure, SameSite cookie rather than a token you store in
      // localStorage, which any injected script on the page can read.
      //
      // await createOrganizationAccount(values);

      // Clear the password out of form state as soon as it has been sent, so
      // it isn't sitting in memory while the app navigates away.
      reset({ ...values, password: '' });
      navigate('/organization');
    } catch (error: unknown) {
      // `unknown`, not `any`: the error has to be narrowed before it can be
      // touched. And nothing from it is shown to the user or logged here — a
      // raw server error can carry stack traces, internal hostnames, or the
      // request body straight into the page.
      setError('root', { type: 'server', message: GENERIC_SUBMIT_ERROR });
    }
  };

  return (
    // Page: grey background, with the card sitting white on top of it
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f1f2f6] px-4 py-16">
      {/* Heading and subtitle sit ABOVE the card */}
      <h1 className="text-center text-[28px] font-bold text-[#1f2a44]">Set up your organization</h1>
      <p className="mt-2 text-center text-sm text-[#6b7280]">
        Create an account to start auditing your team against the Global Standard for their roles.
      </p>

      {/* The white card. 504 = 440 input + 32 padding on each side. */}
      <div className="mt-8 w-[504px] max-w-full rounded-xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Organization name */}
          <div className="mb-4">
            <label htmlFor="organizationName" className={labelClasses}>
              Organization name
            </label>
            <input
              id="organizationName"
              type="text"
              placeholder="Meridian Health"
              autoComplete="organization"
              maxLength={LIMITS.organizationName}
              aria-invalid={errors.organizationName ? true : false}
              aria-describedby={errors.organizationName ? 'organizationName-error' : undefined}
              className={inputClasses}
              {...register('organizationName')}
            />
            {errors.organizationName && (
              <span id="organizationName-error" className={errorClasses}>
                {errors.organizationName.message}
              </span>
            )}
          </div>

          {/* Work email address */}
          <div className="mb-4">
            <label htmlFor="workEmail" className={labelClasses}>
              Work email address
            </label>
            <input
              id="workEmail"
              type="email"
              inputMode="email"
              placeholder="you@yourcompany.com"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={LIMITS.workEmail}
              aria-invalid={errors.workEmail ? true : false}
              aria-describedby={errors.workEmail ? 'workEmail-error' : undefined}
              className={inputClasses}
              {...register('workEmail')}
            />
            {errors.workEmail && (
              <span id="workEmail-error" className={errorClasses}>
                {errors.workEmail.message}
              </span>
            )}
          </div>

          {/* Password. autoComplete="new-password" tells the password manager
              to offer a generated one instead of autofilling an existing
              login, and keeps the browser from prefilling a saved password
              into a signup form. */}
          <div className="mb-4">
            <label htmlFor="password" className={labelClasses}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={LIMITS.password}
              aria-invalid={errors.password ? true : false}
              aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              className={inputClasses}
              {...register('password')}
            />
            {errors.password ? (
              <span id="password-error" className={errorClasses}>
                {errors.password.message}
              </span>
            ) : (
              <span id="password-hint" className="mt-1.5 block text-xs text-[#6b7280]">
                At least 8 characters, with an uppercase letter and a number.
              </span>
            )}
          </div>

          {/* Number of staff to be tested */}
          <div className="mb-4">
            <label htmlFor="staffCount" className={labelClasses}>
              Number of staff to be tested
            </label>
            <input
              id="staffCount"
              type="text"
              placeholder="For example, 50 to 100"
              autoComplete="off"
              maxLength={LIMITS.staffCount}
              aria-invalid={errors.staffCount ? true : false}
              aria-describedby={errors.staffCount ? 'staffCount-error' : undefined}
              className={inputClasses}
              {...register('staffCount')}
            />
            {errors.staffCount && (
              <span id="staffCount-error" className={errorClasses}>
                {errors.staffCount.message}
              </span>
            )}
          </div>

          {/* Whole-form error. role="alert" so a screen reader announces it. */}
          {errors.root && (
            <p role="alert" className="mb-4 text-xs text-[#d9534f]">
              {errors.root.message}
            </p>
          )}

          {/* Submit button — teal for the organization flow. Disabled while
              submitting, which also stops a double-click creating two
              accounts. */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 h-11 w-full max-w-[440px] rounded-lg bg-[#0f8a6a] text-sm font-semibold text-white transition-colors hover:bg-[#0c745a] focus-visible:ring-2 focus-visible:ring-[#0f8a6a] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Create organization account'}
          </button>
        </form>

        {/* Footer line inside the card */}
        <p className="mt-5 text-center text-xs text-[#6b7280]">
          Already have an account?{' '}
          <Link to="/sign-in" className="font-medium text-[#0f8a6a] hover:underline">
            Sign in instead.
          </Link>
        </p>
      </div>
    </div>
  );
};
