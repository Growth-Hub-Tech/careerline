import type { ReactNode } from 'react';

interface ErrorPageProps {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly children?: ReactNode;
  readonly fullScreen?: boolean;
}

export const ErrorPage = ({
  code,
  title,
  description,
  children,
  fullScreen = false,
}: ErrorPageProps) => (
  <div
    className={`flex w-full flex-col items-center justify-center bg-gray-50 px-5 py-16 text-center ${
      fullScreen ? 'min-h-dvh' : 'flex-1'
    }`}
  >
    <span
      data-testid="error-code"
      aria-hidden="true"
      className="font-heading text-[48px] leading-none font-bold text-indigo-800 sm:text-[64px]"
    >
      {code}
    </span>

    <h1 className="mt-4 font-heading text-[24px] leading-[1.25] font-bold text-slate-950 sm:text-[28px]">
      {title}
    </h1>

    <p className="mt-2 max-w-[440px] text-[14px] leading-[1.55] text-slate-600">{description}</p>

    {children && (
      <div className="mt-8 flex w-full max-w-[400px] flex-col gap-3 sm:flex-row sm:justify-center">
        {children}
      </div>
    )}
  </div>
);
