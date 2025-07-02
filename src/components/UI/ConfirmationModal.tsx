import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${
            type === 'danger' ? 'text-red-600' : 'text-yellow-600'
          }`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            type === 'danger'
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;