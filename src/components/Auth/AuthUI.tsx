import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

export const AuthTitle = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <h1
    className={`font-heading text-[24px] leading-tight font-bold text-slate-950 sm:text-[26px] ${className}`}
  >
    {children}
  </h1>
);

export const AuthText = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <p className={`text-[14px] leading-[1.55] text-slate-600 ${className}`}>{children}</p>;

export const DashedLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link
    to={to}
    className={`inline-block border-b-[1.5px] border-dashed border-indigo-700 pb-0.5 text-[13px] font-medium text-indigo-700 transition-colors hover:border-indigo-900 hover:text-indigo-900 ${FOCUS_RING}`}
  >
    {children}
  </Link>
);
