type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

const RING_SIZES: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-8 border-[3px]',
  lg: 'size-16 border-4',
  xl: 'size-56 border-[10px]',
};

const Ring = ({ size }: { size: SpinnerSize }) => (
  <span
    data-testid="spinner-ring"
    data-size={size}
    aria-hidden="true"
    className={`block animate-spin rounded-full border-current/25 border-t-current ${RING_SIZES[size]}`}
  />
);

interface SpinnerProps {
  readonly size?: Exclude<SpinnerSize, 'xl'>;
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

type PageLoaderVariant = 'light' | 'brand';

interface PageLoaderStyle {
  readonly wrapper: string;
  readonly ring: SpinnerSize;
  readonly title: string;
  readonly description: string;
}

const PAGE_STYLES: Record<PageLoaderVariant, PageLoaderStyle> = {
  light: {
    wrapper: 'text-indigo-600',
    ring: 'lg',
    title: 'font-heading text-[18px] leading-[1.3] font-bold text-slate-950',
    description: 'text-[14px] leading-[1.55] text-slate-600',
  },
  brand: {
    wrapper: 'bg-indigo-600 text-amber-500',
    ring: 'xl',
    title: 'text-[24px] leading-[1.3] font-bold text-white',
    description: 'text-[16px] leading-[1.6] text-white/80',
  },
};

interface PageLoaderProps {
  readonly title: string;
  readonly description?: string;
  readonly fullScreen?: boolean;
  readonly variant?: PageLoaderVariant;
  readonly className?: string;
}

export const PageLoader = ({
  title,
  description,
  fullScreen = false,
  variant = 'light',
  className = '',
}: PageLoaderProps) => {
  const style = PAGE_STYLES[variant];

  return (
    <div
      role="status"
      data-variant={variant}
      className={`flex flex-col items-center justify-center gap-8 px-5 py-12 text-center ${style.wrapper} ${
        fullScreen ? 'min-h-dvh' : ''
      } ${className}`}
    >
      <Ring size={style.ring} />
      <div className="flex flex-col gap-3">
        <p className={style.title}>{title}</p>
        {description && <p className={`max-w-[60ch] ${style.description}`}>{description}</p>}
      </div>
    </div>
  );
};
