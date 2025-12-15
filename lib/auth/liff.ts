import { NextRequest } from 'next/server';

/**
 * LIFF IDトークンを検証してユーザーIDを取得
 * 注意: 簡易実装（JWTデコードのみ）。本番環境ではLINE APIで正しく検証する必要があります。
 */
export async function verifyLiffToken(request: NextRequest): Promise<{ userId: string; error?: string }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: '', error: 'Authorization header is missing or invalid' };
  }

  const idToken = authHeader.replace('Bearer ', '');
  
  try {
    // JWTをデコード（簡易実装）
    // 本番環境では LINE API の verifyIdToken エンドポイントを使用して検証する必要があります
    // https://developers.line.biz/ja/reference/line-login-api/#verify-id-token
    const base64Url = idToken.split('.')[1];
    if (!base64Url) {
      return { userId: '', error: 'Invalid token format' };
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload) as any;
    
    if (!decoded || !decoded.sub) {
      return { userId: '', error: 'Invalid token: sub claim missing' };
    }

    // subはLINEユーザーID（アカウントBのuserId）
    return { userId: decoded.sub };
  } catch (error) {
    console.error('Token verification error:', error);
    return { userId: '', error: 'Token verification failed' };
  }
}

