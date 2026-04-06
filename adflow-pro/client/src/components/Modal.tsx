import React from 'react';

export default function Modal({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg relative min-w-[300px]">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">&times;</button>
        {children}
      </div>
    </div>
  );
}
