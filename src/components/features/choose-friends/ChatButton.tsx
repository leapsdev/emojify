interface ChatButtonProps {
  visible: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function ChatButton({
  visible,
  disabled = false,
  onClick,
}: ChatButtonProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4">
      <button
        type="button"
        className="w-full bg-blue-500 text-white rounded-full py-4 text-2xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
        onClick={onClick}
      >
        💬
      </button>
    </div>
  );
}
