/**
 * UI Component Plugin Interface
 *
 * 다양한 UI 라이브러리(shadcn, Tailwind UI, Material 등)를 플러그인으로 주입할 수 있는 인터페이스
 * 프로젝트별로 원하는 UI 라이브러리를 선택하여 사용 가능
 */

import type { ComponentType, ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// ============================================================================
// Button Component Interface
// ============================================================================

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  /** 버튼 스타일 변형 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 로딩 상태 */
  loading?: boolean;
  /** 전체 너비 */
  fullWidth?: boolean;
}

// ============================================================================
// Input Component Interface
// ============================================================================

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  /** 라벨 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 힌트 텍스트 */
  hint?: string;
  /** 입력 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 값 변경 핸들러 */
  onChange?: (value: string) => void;
  /** 전체 너비 */
  fullWidth?: boolean;
}

// ============================================================================
// Card Component Interface
// ============================================================================

export interface CardProps {
  children: ReactNode;
  /** 타이틀 */
  title?: string;
  /** 설명 */
  description?: string;
  /** 패딩 */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** 그림자 */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** 추가 클래스 */
  className?: string;
}

// ============================================================================
// Alert Component Interface
// ============================================================================

export interface AlertProps {
  children: ReactNode;
  /** 알림 타입 */
  variant?: 'info' | 'success' | 'warning' | 'danger';
  /** 제목 */
  title?: string;
  /** 닫기 가능 여부 */
  dismissible?: boolean;
  /** 닫기 핸들러 */
  onClose?: () => void;
}

// ============================================================================
// Select Component Interface
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Component Plugin Registry
// ============================================================================

/**
 * UI 컴포넌트 플러그인 레지스트리
 */
export interface ComponentPlugins {
  Button: ComponentType<ButtonProps>;
  Input: ComponentType<InputProps>;
  Card: ComponentType<CardProps>;
  Alert: ComponentType<AlertProps>;
  Select?: ComponentType<SelectProps>;
}

/**
 * 기본 컴포넌트 플러그인 생성
 * 모든 컴포넌트가 제공되지 않은 경우 기본 구현 사용
 */
export function createComponentPlugins(
  overrides?: Partial<ComponentPlugins>
): ComponentPlugins {
  return {
    Button: overrides?.Button || DefaultButton,
    Input: overrides?.Input || DefaultInput,
    Card: overrides?.Card || DefaultCard,
    Alert: overrides?.Alert || DefaultAlert,
    Select: overrides?.Select,
  };
}

// ============================================================================
// Default Component Implementations (Minimal, No Dependencies)
// ============================================================================

/**
 * 기본 Button 컴포넌트
 */
function DefaultButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    link: 'text-purple-600 hover:text-purple-700 underline-offset-4 hover:underline',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

/**
 * 기본 Input 컴포넌트
 */
function DefaultInput({
  label,
  error,
  hint,
  size = 'md',
  fullWidth = false,
  className = '',
  onChange,
  ...props
}: InputProps) {
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          block rounded-lg border transition-colors
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          focus:ring-2 focus:ring-purple-500 focus:border-purple-500
          ${className}
        `}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  );
}

/**
 * 기본 Card 컴포넌트
 */
function DefaultCard({
  children,
  title,
  description,
  padding = 'md',
  shadow = 'sm',
  className = '',
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${paddingStyles[padding]} ${shadowStyles[shadow]} ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {(title || description) && <div className="mt-4">{children}</div>}
      {!title && !description && children}
    </div>
  );
}

/**
 * 기본 Alert 컴포넌트
 */
function DefaultAlert({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onClose,
}: AlertProps) {
  const variantStyles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${variantStyles[variant]}`}>
      <div className="flex items-start">
        <div className="flex-1">
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && onClose && (
          <button onClick={onClose} className="ml-4 text-current opacity-70 hover:opacity-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
