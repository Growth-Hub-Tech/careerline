import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';

// 1. The rules for the form. Zod checks each field and gives back the message
//    you see under the input when something is wrong.
const signUpSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').min(2, 'Please enter your full name'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// 2. TypeScript type built straight from the rules above, so the two can never
//    drift apart: { fullName: string; email: string; password: string }
type SignUpFormValues = z.infer<typeof signUpSchema>;

// Repeated input styles live in one place so all three inputs stay identical.
// Spec: 400 x 42, 6px radius, 1px border.
const inputClasses =
  'h-[42px] w-full max-w-[400px] rounded-[6px] border border-[#dfe1e7] bg-white px-2 text-sm text-[#1a1a2e] ' +
  'placeholder:text-[#9aa0ab] transition-colors focus:border-[#4a3f8c] focus:outline-none';

export const SignUp = () => {
  const navigate = useNavigate();

  // 3. react-hook-form keeps track of the values, the errors, and whether the
  //    form is currently being submitted.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (values: SignUpFormValues) => {
    // TODO: wire up to the create-account endpoint
    console.log(values);
    navigate('/dashboard');
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white px-4 py-16">
      {/* Heading and subtitle sit ABOVE the card */}
      <h1 className="text-center text-[28px] font-bold text-[#1f2a44]">Create your account</h1>
      <p className="mt-2 text-center text-sm text-[#6b7280]">
        Save your results and track your progress every time you test yourself.
      </p>

      <div className="mt-8 w-[464px] max-w-full rounded-xl bg-[#eff0f4] p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Full name */}
          <div className="mb-4">
            <label htmlFor="fullName" className="mb-2 block text-xs font-semibold text-[#1f2a44]">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Your full name"
              className={inputClasses}
              {...register('fullName')}
            />
            {errors.fullName && (
              <span className="mt-1.5 block text-xs text-[#d9534f]">{errors.fullName.message}</span>
            )}
          </div>

          {/* Email address */}
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#1f2a44]">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={inputClasses}
              {...register('email')}
            />
            {errors.email && (
              <span className="mt-1.5 block text-xs text-[#d9534f]">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="mb-2 block text-xs font-semibold text-[#1f2a44]">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className={inputClasses}
              {...register('password')}
            />
            {errors.password && (
              <span className="mt-1.5 block text-xs text-[#d9534f]">{errors.password.message}</span>
            )}
          </div>

          {/* Submit button — amber, like the mockup */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 h-11 w-full max-w-100 rounded-lg bg-[#dda01a] text-sm font-bold text-[#1f2a44] transition-colors hover:bg-[#c88f16] focus-visible:ring-2 focus-visible:ring-[#1f2a44] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Create your account'}
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
