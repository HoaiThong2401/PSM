import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none justify-center"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 sm:flex-none justify-center"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed pt-1">{message}</p>
      </div>
    </Modal>
  );
};
