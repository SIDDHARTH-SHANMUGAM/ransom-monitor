import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Message {
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationProps {
  message: Message | null;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 200);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
      setIsVisible(false);
    }
  }, [message, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-[100px] left-1/2 -translate-x-1/2 z-50 p-4 rounded-md shadow-lg flex items-center justify-between transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px]'
      } ${
        message?.type === 'success'
          ? 'bg-green-500 text-white'
          : message?.type === 'info'
          ? 'bg-blue-500 text-white'
          : message?.type === 'warning'
          ? 'bg-yellow-500 text-gray-800'
          : 'bg-red-500 text-white'
      }`}
      role="alert"
    >
      <span>{message?.text}</span>
      <button onClick={() => setShow(false)} className="ml-4 focus:outline-none">
        <X className="icon-sm text-white" />
      </button>
    </div>
  );
};

export default Notification;