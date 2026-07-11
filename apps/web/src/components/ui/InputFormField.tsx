import React, { useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const InputFormField = React.forwardRef<HTMLInputElement, InputFormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      required,
      className,
      containerClassName,
      'aria-describedby': customDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `field-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const describedByIds = [customDescribedBy, errorId, helperId]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className={twMerge(clsx('flex flex-col space-y-1.5', containerClassName))}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            {label}
            {required && <span className="ml-1 text-rose-400">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedByIds}
            className={twMerge(
              clsx(
                'glass-input w-full rounded-lg p-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error
                  ? 'border-rose-500/80 focus:border-rose-500 focus:shadow-[0_0_0_2px_rgba(244,63,94,0.2)]'
                  : 'border-slate-800/80 hover:border-slate-700',
                className
              )
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 flex items-center justify-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-rose-400">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

InputFormField.displayName = 'InputFormField';
