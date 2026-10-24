import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button.jsx';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmDisabled = false,
  confirmLoading = false,
  confirmVariant = 'primary',
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        className={`relative w-full ${maxWidth} rounded-2xl bg-white border border-slate-200/90 shadow-modal z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <h3 id="modal-title" className="text-lg font-bold text-navy-950 font-display tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-ring transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-600 leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
          >
            {cancelLabel}
          </Button>

          {onConfirm && (
            <Button
              type="button"
              variant={confirmVariant}
              size="md"
              disabled={confirmDisabled}
              isLoading={confirmLoading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
