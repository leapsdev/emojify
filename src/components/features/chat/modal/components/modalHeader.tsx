interface ModalHeaderProps {
  onSkip: () => void
}

export function ModalHeader({ onSkip }: ModalHeaderProps) {
  return (
    <>
      {/* ドラッグハンドル */}
      <div className="flex justify-center pt-4 pb-6">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
      </div>

      {/* ヘッダー部分 */}
      <div className="flex items-center justify-center relative px-4 pb-4">
        <div className="text-2xl absolute left-1/2 -translate-x-1/2">👦👧</div>
        <button onClick={onSkip} className="text-2xl absolute right-6" aria-label="Skip">
          👉
        </button>
      </div>
    </>
  )
}
