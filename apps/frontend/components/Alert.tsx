import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const alertStyles = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: <XCircle className="w-5 h-5 text-red-600" />,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: <Info className="w-5 h-5 text-blue-600" />,
  },
};

export function Alert({
  type = 'info',
  title,
  message,
  onClose,
  autoClose = true,
  duration = 10000,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  if (!isVisible) return null;

  const style = alertStyles[type];

  return (
    <div
      className={`fixed top-4 right-4 w-full max-w-sm overflow-hidden rounded-lg border ${
        style.border
      } ${
        style.bg
      } shadow-lg transition-all duration-300 ease-in-out ${
        isLeaving ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{style.icon}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {title && (
              <p className={`text-sm font-medium ${style.text}`}>{title}</p>
            )}
            <p className={`mt-1 text-sm ${style.text}`}>{message}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={`inline-flex rounded-md hover:bg-transparent ${style.bg} p-1.5 ${style.text} hover:${style.bg} focus:outline-none focus:ring-2 focus:ring-offset-2`}
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}