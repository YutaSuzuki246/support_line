import { promises as fs } from 'fs';
import path from 'path';

async function getRichMenuById(richMenuId: string, LINE_CHANNEL_ACCESS_TOKEN: string) {
  const res = await fetch(`https://api.line.me/v2/bot/richmenu/${richMenuId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
  return res.ok;
}

export async function setupRichMenu1ForUser(userId: string, LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuId = process.env.LINE_SAMPLE_RICHMENU1;
  if (!richMenuId) throw new Error('LINE_SAMPLE_RICHMENU1が未設定です');
  const setRes = await fetch(`https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
  if (!setRes.ok) {
    const err = await setRes.text();
    throw new Error('リッチメニュー1割り当て失敗: ' + err);
  }
  return { richMenuId };
}

export async function setupRichMenu2ForUser(userId: string, LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuId = process.env.LINE_SAMPLE_RICHMENU2;
  if (!richMenuId) throw new Error('LINE_SAMPLE_RICHMENU2が未設定です');
  const setRes = await fetch(`https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
  if (!setRes.ok) {
    const err = await setRes.text();
    throw new Error('リッチメニュー2割り当て失敗: ' + err);
  }
  return { richMenuId };
}

export async function setupRichMenu3ForUser(userId: string, LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuId = process.env.LINE_SAMPLE_RICHMENU3;
  if (!richMenuId) throw new Error('LINE_SAMPLE_RICHMENU3が未設定です');
  const setRes = await fetch(`https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
  if (!setRes.ok) {
    const err = await setRes.text();
    throw new Error('リッチメニュー3割り当て失敗: ' + err);
  }
  return { richMenuId };
}

export async function setupRichMenuAForUser(userId: string, LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuId = process.env.LINE_SAMPLE_RICHMENUA;
  if (!richMenuId) throw new Error('LINE_SAMPLE_RICHMENUAが未設定です');
  const setRes = await fetch(`https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
  if (!setRes.ok) {
    const err = await setRes.text();
    throw new Error('リッチメニューA割り当て失敗: ' + err);
  }
  return { richMenuId };
}

export async function setupRichMenuBForUser(userId: string, LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuId = process.env.LINE_SAMPLE_RICHMENUB;
  if (!richMenuId) throw new Error('LINE_SAMPLE_RICHMENUBが未設定です');
  const setRes = await fetch(`https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
  if (!setRes.ok) {
    const err = await setRes.text();
    throw new Error('リッチメニューB割り当て失敗: ' + err);
  }
  return { richMenuId };
}

/**
 * リッチメニューエイリアス一覧を取得し、ターミナルに表示する
 */
export async function listRichMenuAliases(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const res = await fetch('https://api.line.me/v2/bot/richmenu/alias/list', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('リッチメニューエイリアス一覧取得失敗: ' + err);
  }
  const data = await res.json();
  if (Array.isArray(data.aliases)) {
    if (data.aliases.length === 0) {
      console.log('リッチメニューエイリアスはありません。');
    } else {
      console.log('リッチメニューエイリアス一覧:');
      data.aliases.forEach((alias: { richMenuAliasId: string; richMenuId: string }) => {
        console.log(`AliasId: ${alias.richMenuAliasId}  RichMenuId: ${alias.richMenuId}`);
      });
    }
  } else {
    console.log('リッチメニューエイリアス情報の取得に失敗しました。');
  }
  return data;
}

/**
 * 全リッチメニュー一覧を取得し、ターミナルに表示する
 */
export async function listRichMenus(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const res = await fetch('https://api.line.me/v2/bot/richmenu/list', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('リッチメニュー一覧取得失敗: ' + err);
  }
  const data = await res.json();
  if (Array.isArray(data.richmenus)) {
    if (data.richmenus.length === 0) {
      console.log('リッチメニューはありません。');
    } else {
      console.log('リッチメニュー一覧:');
      data.richmenus.forEach((menu: any) => {
        console.log(`RichMenuId: ${menu.richMenuId}  Name: ${menu.name}  ChatBarText: ${menu.chatBarText}`);
      });
    }
  } else {
    console.log('リッチメニュー情報の取得に失敗しました。');
  }
  return data;
}

/**
 * 全リッチメニューを削除する
 */
export async function deleteAllRichMenus(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const listRes = await fetch('https://api.line.me/v2/bot/richmenu/list', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
  if (!listRes.ok) {
    const err = await listRes.text();
    throw new Error('リッチメニュー一覧取得失敗: ' + err);
  }
  const data = await listRes.json();
  if (!Array.isArray(data.richmenus) || data.richmenus.length === 0) {
    console.log('削除対象のリッチメニューはありません。');
    return { deleted: 0 };
  }
  let deleted = 0;
  for (const menu of data.richmenus) {
    const delRes = await fetch(`https://api.line.me/v2/bot/richmenu/${menu.richMenuId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
    });
    if (delRes.ok) {
      console.log(`リッチメニュー削除: ${menu.richMenuId}`);
      deleted++;
    } else {
      const err = await delRes.text();
      console.error(`リッチメニュー削除失敗: ${menu.richMenuId} - ${err}`);
    }
  }
  console.log(`削除完了: ${deleted}件のリッチメニューを削除しました。`);
  return { deleted };
}

/**
 * リッチメニュー1を作成する（割り当てはしない）
 */
export async function createRichMenu1(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuBody = {
    size: { width: 1200, height: 810 },
    selected: true,
    name: 'richmenu1',
    chatBarText: 'リッチメニュー1',
    areas: [
      {
        bounds: { x: 0, y: 0, width: 1200, height: 810 },
        action: { type: 'uri', uri: 'https://example.com' }
      }
    ]
  };
  const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(richMenuBody),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error('リッチメニュー1作成失敗: ' + err);
  }
  const data = await createRes.json();
  const richMenuId = data.richMenuId;
  // 画像アップロード
  const imagePath = path.join(process.cwd(), 'public', 'sample_richmenu1.jpg');
  const imageBuffer = await fs.readFile(imagePath);
  const uploadRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/png',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: imageBuffer,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error('リッチメニュー1画像アップロード失敗: ' + err);
  }
  console.log('リッチメニュー1を作成しました。ID:', richMenuId);
  return { richMenuId };
}

/**
 * リッチメニュー2を作成する（割り当てはしない）
 */
export async function createRichMenu2(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuBody = {
    size: { width: 1200, height: 810 },
    selected: true,
    name: 'richmenu2',
    chatBarText: 'リッチメニュー2',
    areas: [
      {
        bounds: { x: 0, y: 0, width: 600, height: 810 },
        action: { type: 'uri', uri: 'https://example1.com' }
      },
      {
        bounds: { x: 600, y: 0, width: 600, height: 810 },
        action: { type: 'uri', uri: 'https://example2.com' }
      }
    ]
  };
  const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(richMenuBody),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error('リッチメニュー2作成失敗: ' + err);
  }
  const data = await createRes.json();
  const richMenuId = data.richMenuId;
  const imagePath = path.join(process.cwd(), 'public', 'sample_richmenu2.jpg');
  const imageBuffer = await fs.readFile(imagePath);
  const uploadRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/png',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: imageBuffer,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error('リッチメニュー2画像アップロード失敗: ' + err);
  }
  console.log('リッチメニュー2を作成しました。ID:', richMenuId);
  return { richMenuId };
}

/**
 * リッチメニュー3を作成する（割り当てはしない）
 */
export async function createRichMenu3(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuBody = {
    size: { width: 1200, height: 810 },
    selected: true,
    name: 'richmenu3',
    chatBarText: 'リッチメニュー3',
    areas: [
      {
        bounds: { x: 0, y: 0, width: 400, height: 810 },
        action: { type: 'uri', uri: 'https://example1.com' }
      },
      {
        bounds: { x: 400, y: 0, width: 400, height: 810 },
        action: { type: 'uri', uri: 'https://example2.com' }
      },
      {
        bounds: { x: 800, y: 0, width: 400, height: 810 },
        action: { type: 'uri', uri: 'https://example3.com' }
      }
    ]
  };
  const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(richMenuBody),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error('リッチメニュー3作成失敗: ' + err);
  }
  const data = await createRes.json();
  const richMenuId = data.richMenuId;
  const imagePath = path.join(process.cwd(), 'public', 'sample_richmenu3.png');
  const imageBuffer = await fs.readFile(imagePath);
  const uploadRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/png',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: imageBuffer,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error('リッチメニュー3画像アップロード失敗: ' + err);
  }
  console.log('リッチメニュー3を作成しました。ID:', richMenuId);
  return { richMenuId };
}

/**
 * リッチメニューAを作成する
 */
export async function createRichMenuA(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuBody = {
    size: { width: 1200, height: 810 },
    selected: true,
    name: 'richmenuA',
    chatBarText: 'リッチメニューA',
    areas: [
      {
        bounds: { x: 660, y: 0, width: 540, height: 200 },
        action: {
          type: 'richmenuswitch',
          richMenuAliasId: 'richmenu-alias-b',
          data: 'richmenu-changed-to-b',
          label: 'Bメニューへ切替'
        }
      },
      {
        bounds: { x: 0, y: 200, width: 1200, height: 305 },
        action: { type: 'uri', uri: 'https://example1.com/' }
      },
      {
        bounds: { x: 0, y: 505, width: 400, height: 305 },
        action: { type: 'uri', uri: 'https://example2.com/' }
      },
      {
        bounds: { x: 401, y: 505, width: 400, height: 305 },
        action: { type: 'uri', uri: 'https://example3.com/' }
      },
      {
        bounds: { x: 801, y: 505, width: 400, height: 305 },
        action: { type: 'uri', uri: 'https://example4.com/' }
      }
    ]
  };
  const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(richMenuBody),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error('リッチメニューA作成失敗: ' + err);
  }
  const data = await createRes.json();
  const richMenuId = data.richMenuId;
  const imagePath = path.join(process.cwd(), 'public', 'sample_richmenuA.jpg');
  const imageBuffer = await fs.readFile(imagePath);
  const uploadRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/jpeg',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: imageBuffer,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error('リッチメニューA画像アップロード失敗:', err);
    throw new Error('リッチメニューA画像アップロード失敗: ' + err);
  }
  console.log('リッチメニューAを作成しました。ID:', richMenuId);
  return { richMenuId };
}

/**
 * リッチメニューBを作成する
 */
export async function createRichMenuB(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuBody = {
    size: { width: 1200, height: 810 },
    selected: true,
    name: 'richmenuB',
    chatBarText: 'リッチメニューB',
    areas: [
      {
        bounds: { x: 0, y: 0, width: 540, height: 200 },
        action: {
          type: 'richmenuswitch',
          richMenuAliasId: 'richmenu-alias-a',
          data: 'richmenu-changed-to-a',
          label: 'Aメニューへ切替'
        }
      },
      {
        bounds: { x: 0, y: 200, width: 822, height: 610 },
        action: { type: 'uri', uri: 'https://example1.com/' }
      },
      {
        bounds: { x: 823, y: 200, width: 378, height: 305 },
        action: { type: 'uri', uri: 'https://example2.com/' }
      },
      {
        bounds: { x: 823, y: 505, width: 378, height: 305 },
        action: { type: 'uri', uri: 'https://example3.com/' }
      }
    ]
  };
  const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(richMenuBody),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error('リッチメニューB作成失敗: ' + err);
  }
  const data = await createRes.json();
  const richMenuId = data.richMenuId;
  const imagePath = path.join(process.cwd(), 'public', 'sample_richmenuB.jpg');
  const imageBuffer = await fs.readFile(imagePath);
  const uploadRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/jpeg',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: imageBuffer,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error('リッチメニューB画像アップロード失敗:', err);
    throw new Error('リッチメニューB画像アップロード失敗: ' + err);
  }
  console.log('リッチメニューBを作成しました。ID:', richMenuId);
  return { richMenuId };
}

/**
 * リッチメニューAのエイリアスを作成する
 */
export async function createRichMenuAliasA(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuId = process.env.LINE_SAMPLE_RICHMENUA;
  if (!richMenuId) throw new Error('LINE_SAMPLE_RICHMENUAが未設定です');
  const body = {
    richMenuAliasId: 'richmenu-alias-a',
    richMenuId,
  };
  const res = await fetch('https://api.line.me/v2/bot/richmenu/alias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('リッチメニューAエイリアス作成失敗: ' + err);
  }
  return { richMenuAliasId: 'richmenu-alias-a', richMenuId };
}

/**
 * リッチメニューBのエイリアスを作成する
 */
export async function createRichMenuAliasB(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuId = process.env.LINE_SAMPLE_RICHMENUB;
  if (!richMenuId) throw new Error('LINE_SAMPLE_RICHMENUBが未設定です');
  const body = {
    richMenuAliasId: 'richmenu-alias-b',
    richMenuId,
  };
  const res = await fetch('https://api.line.me/v2/bot/richmenu/alias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('リッチメニューBエイリアス作成失敗: ' + err);
  }
  return { richMenuAliasId: 'richmenu-alias-b', richMenuId };
}

/**
 * リッチメニューエイリアスAを更新する
 */
export async function updateRichMenuAliasA(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuId = process.env.LINE_SAMPLE_RICHMENUA;
  if (!richMenuId) throw new Error('LINE_SAMPLE_RICHMENUAが未設定です');
  const res = await fetch('https://api.line.me/v2/bot/richmenu/alias/richmenu-alias-a', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ richMenuId }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('リッチメニューエイリアスA更新失敗: ' + err);
  }
  return { richMenuAliasId: 'richmenu-alias-a', richMenuId };
}

/**
 * リッチメニューエイリアスBを更新する
 */
export async function updateRichMenuAliasB(LINE_CHANNEL_ACCESS_TOKEN: string) {
  const richMenuId = process.env.LINE_SAMPLE_RICHMENUB;
  if (!richMenuId) throw new Error('LINE_SAMPLE_RICHMENUBが未設定です');
  const res = await fetch('https://api.line.me/v2/bot/richmenu/alias/richmenu-alias-b', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ richMenuId }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('リッチメニューエイリアスB更新失敗: ' + err);
  }
  return { richMenuAliasId: 'richmenu-alias-b', richMenuId };
}
