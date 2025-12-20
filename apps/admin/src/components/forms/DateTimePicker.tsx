'use client';

import { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { cn } from '@auction/ui/lib/utils';

import 'react-datepicker/dist/react-datepicker.css';

// 한국어 로케일 등록
registerLocale('ko', ko);

interface DateTimePickerProps {
  label?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  timeIntervals?: number;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  showTimeSelect = true,
  timeIntervals = 30,
  placeholder = '날짜를 선택하세요',
  error,
  required,
  disabled,
}: DateTimePickerProps) {
  const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-2.5 bg-slate-800/50 border rounded-xl text-left',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
          'transition-all duration-200 flex items-center justify-between',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          error ? 'border-red-500/50' : 'border-white/10'
        )}
      >
        <span className={value ? 'text-white' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    )
  );
  CustomInput.displayName = 'CustomInput';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <DatePicker
        selected={value}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeIntervals={timeIntervals}
        timeFormat="HH:mm"
        dateFormat="yyyy-MM-dd HH:mm"
        locale="ko"
        minDate={minDate}
        maxDate={maxDate}
        customInput={<CustomInput />}
        popperClassName="dark-datepicker"
        calendarClassName="dark-calendar"
        disabled={disabled}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}

      <style jsx global>{`
        .dark-datepicker {
          z-index: 50;
        }
        .dark-calendar {
          background-color: rgb(30 41 59) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        }
        .dark-calendar .react-datepicker__header {
          background-color: rgb(30 41 59) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
          padding-top: 12px !important;
        }
        .dark-calendar .react-datepicker__current-month,
        .dark-calendar .react-datepicker__day-name,
        .dark-calendar .react-datepicker-time__header {
          color: white !important;
        }
        .dark-calendar .react-datepicker__day {
          color: #d1d5db !important;
          border-radius: 8px !important;
        }
        .dark-calendar .react-datepicker__day:hover {
          background-color: rgba(147, 51, 234, 0.3) !important;
          color: white !important;
        }
        .dark-calendar .react-datepicker__day--selected,
        .dark-calendar .react-datepicker__day--keyboard-selected {
          background: linear-gradient(to right, rgb(147, 51, 234), rgb(6, 182, 212)) !important;
          color: white !important;
        }
        .dark-calendar .react-datepicker__day--disabled {
          color: #4b5563 !important;
        }
        .dark-calendar .react-datepicker__day--outside-month {
          color: #6b7280 !important;
        }
        .dark-calendar .react-datepicker__navigation-icon::before {
          border-color: #9ca3af !important;
        }
        .dark-calendar .react-datepicker__navigation:hover *::before {
          border-color: white !important;
        }
        .dark-calendar .react-datepicker__time-container {
          border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .dark-calendar .react-datepicker__time {
          background-color: rgb(30 41 59) !important;
          border-bottom-right-radius: 12px !important;
        }
        .dark-calendar .react-datepicker__time-box {
          background-color: rgb(30 41 59) !important;
        }
        .dark-calendar .react-datepicker__time-list-item {
          color: #d1d5db !important;
        }
        .dark-calendar .react-datepicker__time-list-item:hover {
          background-color: rgba(147, 51, 234, 0.3) !important;
          color: white !important;
        }
        .dark-calendar .react-datepicker__time-list-item--selected {
          background: linear-gradient(to right, rgb(147, 51, 234), rgb(6, 182, 212)) !important;
          color: white !important;
        }
        .dark-calendar .react-datepicker__triangle {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
