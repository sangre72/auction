export default function UsedGoodsPage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-5xl">🏷️</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">중고거래</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          검증된 중고 피규어를 안전하게 거래하세요.
          <br />
          서비스 준비 중입니다.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Coming Soon
        </div>
      </div>
    </div>
  );
}
