'use client';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-300',
    error: 'bg-red-50 text-red-800 border-red-300',
    info: 'bg-blue-50 text-blue-800 border-blue-300',
  };

  return (
    <div className={`flex items-center justify-between border rounded-lg px-4 py-3 mb-4 text-sm ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}
