'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ title, onClose, children, size = 'md', className }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ds-modal-title"
        className={cn(
          'flex max-h-[100dvh] w-full flex-col overflow-hidden border border-ink/10 bg-surface sm:max-h-[90vh]',
          sizeClasses[size],
          className
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-ink/10 px-4 py-4 sm:px-6">
          <h2 id="ds-modal-title" className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted transition-colors hover:text-ink"
            aria-label="Stäng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

interface ConfirmModalProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Avbryt',
  onConfirm,
  onCancel,
  variant = 'primary',
}: ConfirmModalProps) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <div className="p-4 sm:p-6">
        <div className="mb-6 text-base text-muted">{message}</div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-3 text-base font-medium text-ink transition-colors hover:bg-bg-sage sm:w-auto sm:py-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'w-full px-4 py-3 text-base font-medium text-white transition-colors sm:w-auto sm:py-2',
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-teal hover:opacity-90'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
