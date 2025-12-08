import liff from '@line/liff';

export async function initLiff() {
  try {
    if (!liff.isInClient() && !liff.isLoggedIn()) {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
      liff.login(); // 外ブラウザで未ログイン時はLINEログインへ誘導
    } else {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
    }
  } catch (err) {
    console.error('[LIFF 初期化エラー]', err);
    throw err;
  }
}

export function isLoggedIn(): boolean {
  return liff.isLoggedIn();
}

export function getProfile() {
  return liff.getProfile();
}

export function getIDToken(): string | null {
  return liff.getIDToken();
}

export function logout() {
  liff.logout();
  location.reload();
}

export function closeLiffWindow() {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
}
