import type { ReactNode } from 'react';
import createImage from '../../assests/create.png';
import { AuthHeader } from './AuthHeader';
import { TestimonialCard } from './TestimonialCard';

/** Form on the left, create.png + testimonial on the right (photo hidden below lg). */
export const SplitAuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-dvh w-full bg-white">
    <div className="flex min-h-dvh w-full flex-col lg:w-1/2">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-[400px]">{children}</div>
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
        <div className="absolute inset-x-10 bottom-10">
          <TestimonialCard />
        </div>
      </div>
    </aside>
  </div>
);

interface CardAuthLayoutProps {
  readonly children: ReactNode;
  readonly showActions?: boolean;
}

/** Grey page with a single white card in the centre. */
export const CardAuthLayout = ({ children, showActions = false }: CardAuthLayoutProps) => (
  <div className="flex min-h-dvh w-full flex-col bg-gray-50">
    <AuthHeader contained showActions={showActions} />
    <main className="flex flex-1 items-center justify-center px-5 py-12">
      <div className="w-full max-w-[400px] border border-slate-200 bg-white px-6 py-10 sm:px-8 sm:py-12">
        {children}
      </div>
    </main>
  </div>
);
