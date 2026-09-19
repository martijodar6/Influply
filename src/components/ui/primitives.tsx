import { clsx } from 'clsx';
import Link from 'next/link';
import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

// A small, consistent set of building blocks (button, field, card, badge)
// shared across every screen — deliberately plain Tailwind, no component
// library, so the visual language stays cohesive end to end.

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-200',
  secondary: 'bg-ink-100 text-ink-900 hover:bg-ink-100/70',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100',
  danger: 'bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50'
};

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed',
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = 'primary',
  className,
  children
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition',
        buttonVariants[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Field({
  label,
  hint,
  required,
  children
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs text-ink-300">{hint}</span> : null}
    </label>
  );
}

const fieldClass =
  'rounded-xl2 border border-ink-100 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(fieldClass, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(fieldClass, 'min-h-[100px] resize-y', props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(fieldClass, props.className)} />;
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx('rounded-xl2 border border-ink-100 bg-white p-6 shadow-soft', className)}>{children}</div>;
}

export function Badge({
  tone = 'neutral',
  children
}: {
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-ink-100 text-ink-700',
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700'
  };
  return <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone])}>{children}</span>;
}

export function Chip({
  active,
  onClick,
  children,
  type = 'button'
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
        active ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-100 bg-white text-ink-700 hover:border-brand-200'
      )}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-dashed border-ink-100 bg-white/60 px-8 py-14 text-center">
      <p className="text-base font-semibold text-ink-900">{title}</p>
      <p className="max-w-sm text-sm text-ink-500">{description}</p>
      {action}
    </div>
  );
}
