import { test, expect } from '@playwright/test';

test.describe('OAuth 소셜 로그인', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('홈페이지에 소셜 로그인 버튼이 표시된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '소셜 로그인' })).toBeVisible();
    await expect(page.getByRole('button', { name: /구글로 계속하기/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /카카오로 계속하기/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /네이버로 계속하기/ })).toBeVisible();
  });

  test.describe('카카오 로그인', () => {
    test('카카오 버튼 클릭 시 카카오 OAuth URL로 이동', async ({ page }) => {
      // 네비게이션 이벤트 캡처
      const [request] = await Promise.all([
        page.waitForRequest((req) => req.url().includes('/api/auth/kakao')),
        page.getByRole('button', { name: /카카오로 계속하기/ }).click(),
      ]);

      expect(request.url()).toContain('/api/auth/kakao');
    });
  });

  test.describe('네이버 로그인', () => {
    test('네이버 버튼 클릭 시 네이버 OAuth URL로 이동', async ({ page }) => {
      const [request] = await Promise.all([
        page.waitForRequest((req) => req.url().includes('/api/auth/naver')),
        page.getByRole('button', { name: /네이버로 계속하기/ }).click(),
      ]);

      expect(request.url()).toContain('/api/auth/naver');
    });
  });

  test.describe('구글 로그인', () => {
    test('구글 버튼 클릭 시 구글 OAuth URL로 이동', async ({ page }) => {
      const [request] = await Promise.all([
        page.waitForRequest((req) => req.url().includes('/api/auth/google')),
        page.getByRole('button', { name: /구글로 계속하기/ }).click(),
      ]);

      expect(request.url()).toContain('/api/auth/google');
    });
  });
});

test.describe('OAuth 에러 페이지', () => {
  test('사용자 거부 에러 페이지 표시', async ({ page }) => {
    await page.goto('/auth/error?reason=user_denied&provider=kakao');

    // 에러 페이지가 올바르게 표시되는지 확인
    await expect(page.locator('body')).toContainText(/취소|거부|denied/i);
  });

  test('잘못된 state 에러 페이지 표시', async ({ page }) => {
    await page.goto('/auth/error?reason=invalid_state&provider=google');

    await expect(page.locator('body')).toContainText(/보안|다시 시도/i);
  });
});

test.describe('OAuth 성공 페이지', () => {
  test('성공 페이지에 사용자 정보 표시', async ({ page }) => {
    const mockUser = {
      id: '12345',
      email: 'test@example.com',
      name: 'TestUser',
      provider: 'kakao',
    };

    await page.goto(
      `/auth/success?user=${encodeURIComponent(JSON.stringify(mockUser))}`
    );

    // 성공 페이지 내용 확인
    await expect(page.locator('body')).toContainText(/성공|환영|로그인/i);
  });
});
