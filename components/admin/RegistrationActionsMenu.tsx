'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Trash2, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface RegistrationActionsMenuProps {
  registrationId: string;
  isOpen: boolean;
  isCancelled: boolean;
  onToggle: () => void;
  onClose: () => void;
  onCancel: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}

export function RegistrationActionsMenu({
  registrationId,
  isOpen,
  isCancelled,
  onToggle,
  onClose,
  onCancel,
  onReactivate,
  onDelete,
}: RegistrationActionsMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 192;
    const left = Math.max(8, rect.right - menuWidth);

    setPosition({
      top: rect.bottom + 8,
      left,
    });
  }, [isOpen, registrationId]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        className="p-1 text-muted transition-colors hover:text-ink"
        aria-label="Åtgärder"
        aria-expanded={isOpen}
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 w-48 border border-ink/10 bg-surface shadow-dropdown"
            style={{ top: position.top, left: position.left }}
          >
            {isCancelled ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onReactivate();
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-base text-teal transition-colors hover:bg-bg-sage"
                >
                  <XCircle className="h-4 w-4" />
                  Återaktivera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-base text-error transition-colors hover:bg-error-bg"
                >
                  <Trash2 className="h-4 w-4" />
                  Ta bort permanent
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onCancel();
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-base text-ink transition-colors hover:bg-bg-sage"
                >
                  <XCircle className="h-4 w-4" />
                  Avregistrera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-4 py-2.5 text-left text-base text-error transition-colors hover:bg-error-bg'
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  Ta bort permanent
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
