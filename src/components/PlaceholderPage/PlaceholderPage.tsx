import { Link } from 'react-router-dom';
import { StatusLabel } from '../StatusLabel';

interface PlaceholderPageProps {
  readonly title: string;
  readonly description: string;
}

export const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => (
  <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 bg-gray-50 px-5 py-20 text-center">
    <StatusLabel status="info">Coming soon</StatusLabel>
    <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950 sm:text-[32px]">
      {title}
    </h1>
    <p className="max-w-[48ch] text-[15px] leading-[1.55] text-slate-600">{description}</p>
    <Link
      to="/"
      className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-6 text-[15px] font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      Go to homepage
    </Link>
  </div>
);
