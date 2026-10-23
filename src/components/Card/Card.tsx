import { useId, type ReactNode } from 'react';

type HeadingLevel = 2 | 3 | 4;

interface CardProps {
  readonly title?: string;
  readonly description?: string;
  readonly icon?: ReactNode;
  readonly headingLevel?: HeadingLevel;
  readonly footer?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
}

export const Card = ({
  title,
  description,
  icon,
  headingLevel = 3,
  footer,
  children,
  className = '',
}: CardProps) => {
  const titleId = useId();
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const Wrapper = title ? 'section' : 'div';

  return (
    <Wrapper
      aria-labelledby={title ? titleId : undefined}
      className={`flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 ${className}`}
    >
      {(icon || title || description) && (
        <div className="flex flex-col gap-3">
          {icon && (
            <span
              data-testid="card-icon"
              aria-hidden="true"
              className="flex size-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800"
            >
              {icon}
            </span>
          )}
          {title && (
            <Heading
              id={titleId}
              className="font-heading text-[18px] leading-[1.3] font-bold text-slate-950"
            >
              {title}
            </Heading>
          )}
          {description && (
            <p className="text-[14px] leading-[1.55] text-slate-600">{description}</p>
          )}
        </div>
      )}

      {children && <div className="text-[14px] text-slate-800">{children}</div>}

      {footer && <div className="mt-auto flex flex-wrap items-center gap-3">{footer}</div>}
    </Wrapper>
  );
};
