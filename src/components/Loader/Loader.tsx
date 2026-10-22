type SpinnerSize = 'sm' | 'md' | 'lg';

const RING_SIZES: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-8 border-[3px]',
  lg: 'size-16 border-4',
};

const Ring = ({ size }: { size: SpinnerSize }) => (
  <span
    data-testid="spinner-ring"
    aria-hidden="true"
    className={`block animate-spin rounded-full border-current/25 border-t-current ${RING_SIZES[size]}`}
  />
);

interface SpinnerProps {
  readonly size?: SpinnerSize;
  readonly label?: string;
  readonly className?: string;
}

export const Spinner = ({ size = 'md', label = 'Loading', className = '' }: SpinnerProps) => (
  <span
    role="status"
    data-size={size}
    className={`inline-flex items-center justify-center text-indigo-600 ${className}`}
  >
    <Ring size={size} />
    <span className="sr-only">{label}</span>
  </span>
);

interface PageLoaderProps {
  readonly title: string;
  readonly description?: string;
  readonly fullScreen?: boolean;
  readonly className?: string;
}

export const PageLoader = ({
  title,
  description,
  fullScreen = false,
  className = '',
}: PageLoaderProps) => (
  <div
    role="status"
    className={`flex flex-col items-center justify-center gap-5 px-5 py-12 text-center text-indigo-600 ${
      fullScreen ? 'min-h-dvh' : ''
    } ${className}`}
  >
    <Ring size="lg" />
    <div className="flex flex-col gap-2">
      <p className="font-heading text-[18px] leading-[1.3] font-bold text-slate-950">{title}</p>
      {description && (
        <p className="max-w-[44ch] text-[14px] leading-[1.55] text-slate-600">{description}</p>
      )}
    </div>
  </div>
);
