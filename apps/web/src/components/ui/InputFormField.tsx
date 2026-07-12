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
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
          >
            {label}
            {required && <span className="ml-1 text-error">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-on-surface-variant">
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
                'w-full rounded-lg bg-surface-container-lowest p-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none transition-all',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error
                  ? 'border border-error focus:border-error focus:ring-2 focus:ring-error/20'
                  : 'border border-outline-variant hover:border-outline-variant/80 focus:border-primary focus:ring-2 focus:ring-primary/20',
                className
              )
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 flex items-center justify-center text-on-surface-variant">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p id={errorId} role="alert" className="text-xs font-semibold text-error">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-on-surface-variant">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

InputFormField.displayName = 'InputFormField';
