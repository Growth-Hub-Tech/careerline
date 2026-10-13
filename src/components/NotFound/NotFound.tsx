import { Link, useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center bg-[#f1f2f6] px-5 py-12 sm:px-4 sm:py-16">
      <span
        aria-hidden="true"
        className="font-heading text-[48px] leading-none font-bold text-[#4a3f8c] sm:text-[64px]"
      >
        404
      </span>

      <h1 className="mt-4 text-center font-heading text-[24px] font-bold text-[#1f2a44] sm:text-[28px]">
        Page not found
      </h1>

      <p className="mt-2 max-w-[440px] text-center text-sm text-[#6b7280]">
        We couldn't find that page. Try the homepage, or get in touch if you followed a link from
        us.
      </p>

      <div className="mt-8 flex w-full max-w-[400px] flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/"
          className="flex h-11 items-center justify-center rounded-lg bg-[#4a3f8c] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#3e3576] focus-visible:ring-2 focus-visible:ring-[#4a3f8c] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Go to homepage
        </Link>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-11 rounded-lg border-[1px] border-solid border-[#d9dbe3] bg-white px-6 text-sm font-semibold text-[#1f2a44] transition-colors hover:bg-[#f7f7fb] focus-visible:ring-2 focus-visible:ring-[#4a3f8c] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Go back
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-[#6b7280]">
        Still stuck?{' '}
        <Link to="/contact" className="font-medium text-[#4a3f8c] hover:underline">
          Contact us.
        </Link>
      </p>
    </div>
  );
};
