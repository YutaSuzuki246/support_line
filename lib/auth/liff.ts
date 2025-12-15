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
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return { userId: '', error: 'Invalid token format' };
    }

    const base64Url = parts[1];
    if (!base64Url) {
      return { userId: '', error: 'Invalid token format' };
    }
    
    // Base64 URLデコード
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // パディングを追加
    while (base64.length % 4) {
      base64 += '=';
    }

    // Base64デコード
    const decodedBuffer = Buffer.from(base64, 'base64');
    const jsonPayload = decodedBuffer.toString('utf-8');

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

