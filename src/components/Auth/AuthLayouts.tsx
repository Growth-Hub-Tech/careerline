import type { ReactNode } from 'react';
import createImage from '../../assets/create.webp';
import { AuthHeader } from './AuthHeader';
import { TestimonialCard } from './TestimonialCard';

/** Form on the left, create.webp + testimonial on the right (photo hidden below lg). */
export const SplitAuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-dvh w-full bg-white">
    <div className="flex min-h-dvh w-full flex-col lg:w-1/2">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-100">{children}</div>
      </main>
    </div>

    <aside className="relative hidden lg:block lg:w-1/2">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <img
          src={createImage}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0">
          <TestimonialCard />
        </div>
      </div>
    </aside>
  </div>
);

interface CardAuthLayoutProps {
  readonly children: ReactNode;
  readonly showActions?: boolean;
  readonly wide?: boolean;
}

/** Grey page with a single white card in the centre. */
export const CardAuthLayout = ({
  children,
  showActions = false,
  wide = false,
}: CardAuthLayoutProps) => (
  <div className="flex min-h-dvh w-full flex-col bg-gray-50">
    <AuthHeader contained showActions={showActions} />
    <main className="flex flex-1 items-center justify-center px-5 py-12">
      <div
        className={`w-full border border-slate-200 bg-white px-6 py-10 sm:py-12 ${
          wide ? 'max-w-[888px] sm:px-11' : 'max-w-100 sm:px-8'
        }`}
      >
        {children}
      </div>
    </main>
  </div>
);
