'use client';

interface QueueOverlayProps {
  position: number;
  message: string;
  onLeave?: () => void;
}

export function QueueOverlay({ position, message, onLeave }: QueueOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
        {/* 대기열 아이콘 */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* 대기 순서 */}
        <div className="mb-4">
          <span className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {position}
          </span>
          <span className="text-2xl text-gray-500 ml-2">번째</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">대기 중입니다</h2>
        <p className="text-gray-500 mb-6">{message}</p>

        {/* 진행 상태 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" />
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          />
        </div>

        <p className="text-sm text-gray-400 mb-6">
          순서가 되면 자동으로 입장됩니다
        </p>

        {/* 나가기 버튼 */}
        {onLeave && (
          <button
            onClick={onLeave}
            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
          >
            대기열 나가기
          </button>
        )}
      </div>
    </div>
  );
}
