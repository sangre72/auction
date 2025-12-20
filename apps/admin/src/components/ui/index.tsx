'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@auction/ui/lib/utils';

// ============================================
// Button Component (Material Design Style)
// ============================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-purple-500/25',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    outline: 'border border-white/20 hover:bg-white/5 text-white',
    ghost: 'hover:bg-white/5 text-gray-300',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transform active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}

// ============================================
// Search Input Component
// ============================================
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export function SearchInput({ onSearch, className, ...props }: SearchInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
        placeholder="검색..."
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </form>
  );
}

// ============================================
// Tooltip Component
// ============================================
interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={cn(
          'absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-slate-700 rounded-lg shadow-lg whitespace-nowrap',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          positions[position]
        )}>
          {content}
          <div className={cn(
            'absolute w-2 h-2 bg-slate-700 rotate-45',
            position === 'top' && 'top-full left-1/2 -translate-x-1/2 -mt-1',
            position === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
            position === 'left' && 'left-full top-1/2 -translate-y-1/2 -ml-1',
            position === 'right' && 'right-full top-1/2 -translate-y-1/2 -mr-1'
          )} />
        </div>
      )}
    </div>
  );
}

// ============================================
// Badge Component
// ============================================
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-700 text-gray-300',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

// ============================================
// Card Component
// ============================================
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div className={cn(
      'rounded-2xl bg-slate-800/50 border border-white/5 p-6',
      hover && 'transition-all hover:bg-slate-800 hover:border-white/10 hover:shadow-xl cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
}

// ============================================
// DataGrid Component
// ============================================
interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (item: T) => ReactNode;
}

interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataGrid<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading,
}: DataGridProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-8 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-white/5'
                  )}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-300">
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// Alert/Tip Component
// ============================================
interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  onClose?: () => void;
}

export function Alert({ children, variant = 'info', title, onClose }: AlertProps) {
  const variants = {
    info: {
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      icon: 'text-cyan-400',
      title: 'text-cyan-300',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      icon: 'text-emerald-400',
      title: 'text-emerald-300',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      icon: 'text-amber-400',
      title: 'text-amber-300',
    },
    danger: {
      bg: 'bg-red-500/10 border-red-500/30',
      icon: 'text-red-400',
      title: 'text-red-300',
    },
  };

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    danger: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={cn(
      'rounded-xl border p-4',
      variants[variant].bg
    )}>
      <div className="flex gap-3">
        <div className={variants[variant].icon}>
          {icons[variant]}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={cn('font-semibold mb-1', variants[variant].title)}>
              {title}
            </h4>
          )}
          <p className="text-sm text-gray-300">{children}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Skeleton Component
// ============================================
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'animate-pulse bg-slate-700/50 rounded-lg',
      className
    )} />
  );
}

// ============================================
// Tabs Component
// ============================================
interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-white/5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === tab.id
              ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============================================
// Input Component
// ============================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-2.5 bg-slate-800/50 border rounded-xl text-white placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-500/50' : 'border-white/10',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

// ============================================
// Textarea Component
// ============================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({ label, error, helperText, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
          'transition-all duration-200 resize-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-500/50' : 'border-white/10',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

// ============================================
// Select Component
// ============================================
interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  error,
  required,
  disabled,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div ref={selectRef} className={cn('relative', className)}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full px-4 py-2.5 bg-slate-800/50 border rounded-xl text-left',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
            'transition-all duration-200 flex items-center justify-between',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            error ? 'border-red-500/50' : 'border-white/10'
          )}
        >
          <span className={selectedOption ? 'text-white' : 'text-gray-500'}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <svg
            className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-left flex items-center gap-2 transition-colors',
                    option.value === value
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {option.icon}
                  {option.label}
                  {option.value === value && (
                    <svg className="w-4 h-4 ml-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

// ============================================
// Label Component
// ============================================
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ children, required, className, ...props }: LabelProps) {
  return (
    <label className={cn('block text-sm font-medium text-gray-300', className)} {...props}>
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}
