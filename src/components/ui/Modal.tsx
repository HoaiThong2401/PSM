import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Dialog */}
      <div
        className={twMerge(
          clsx(
            'relative w-full max-h-[88dvh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-10 overflow-hidden animate-slide-up sm:my-auto',
            maxWidths[maxWidth]
          )
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

        {/* Modal Header (Fixed at top - matching bg with dialog & footer) */}
        <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="pr-2 min-w-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{title}</h2>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body (matching bg) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain bg-white dark:bg-slate-900">
          {children}
        </div>

        {/* Dedicated Fixed Footer (Matching bg & border with Header) */}
        {footer && (
          <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
