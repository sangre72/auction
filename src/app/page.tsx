import SocialLoginButtons from '@/components/SocialLoginButtons';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">소셜 로그인</h1>
          <p className="text-gray-600">
            카카오, 네이버, 구글 계정으로 간편하게 로그인하세요
          </p>
        </div>
        <SocialLoginButtons />
      </div>
    </main>
  );
}
