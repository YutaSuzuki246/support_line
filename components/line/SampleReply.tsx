// LINE Messaging APIのテキスト・テキスト2応答ロジック
import {
  setupRichMenu1ForUser,
  setupRichMenu2ForUser,
  setupRichMenu3ForUser,
  setupRichMenuAForUser,
  setupRichMenuBForUser,
  listRichMenuAliases,
  listRichMenus,
  deleteAllRichMenus,
  createRichMenu1,
  createRichMenu2,
  createRichMenu3,
  createRichMenuA,
  createRichMenuB,
  createRichMenuAliasA,
  createRichMenuAliasB,
  updateRichMenuAliasA,
  updateRichMenuAliasB
} from './SampleRichMenu';

export async function handleSampleReply({ replyToken, userMessage, LINE_CHANNEL_ACCESS_TOKEN, userId }: {
  replyToken: string;
  userMessage: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  userId: string;
}) {
  // 「テキスト」への応答
  if (userMessage === 'テキスト') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          "type": "text",
          "text": "$ LINE絵文字 $",
          "emojis": [
            {
              "index": 0,
              "productId": "5ac1bfd5040ab15980c9b435",
              "emojiId": "001"
            },
            {
              "index": 13,
              "productId": "5ac1bfd5040ab15980c9b435",
              "emojiId": "002"
            }
          ]
        },
      ],
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
    return true;
  }

  // 「テキスト2」への応答
  if (userMessage === 'テキスト2') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "textV2",
          text: "テストV2\n1. 絵文字1: {smile}\n2. 絵文字2: {wink}\n3. 改行\n4. 通常テキスト\n5. 絵文字複数: {smile}{wink}",
          substitution: {
            smile: {
              type: "emoji",
              productId: "5ac1bfd5040ab15980c9b435",
              emojiId: "001"
            },
            wink: {
              type: "emoji",
              productId: "5ac1bfd5040ab15980c9b435",
              emojiId: "002"
            }
          }
        }
      ]
    };
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
    console.log('LINE reply response:', await res.text());
    return true;
  }

  // 「スタンプ」への応答
  if (userMessage === 'スタンプ') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "sticker",
          packageId: "11538",
          stickerId: "51626494"
        },
      ],
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「画像」への応答
  if (userMessage === '画像') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "image",
          originalContentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/favicon.webp`,
          previewImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/favicon.webp`
        },
      ],
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「動画」への応答
  if (userMessage === '動画') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          "type": "video",
          "originalContentUrl": `${process.env.NEXT_PUBLIC_APP_URL}/sample.mp4`,
          "previewImageUrl": `${process.env.NEXT_PUBLIC_APP_URL}/preview_image.jpg`,
          "trackingId": "track-id"
        },
      ],
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「音声」への応答
  if (userMessage === '音声') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "audio",
          originalContentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/maou_10_where_you_are.mp3`,
          duration: 480000 // ミリ秒
        },
      ],
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「位置情報」への応答
  if (userMessage === '位置情報') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "location",
          title: "株式会社テクノチェーン　オフィス",
          address: "〒105-0023 東京都港区芝浦１丁目４ 芝浦SFビル",
          latitude: 35.648744,
          longitude: 139.755448
        },
      ],
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「イメージマップ」への応答
  if (userMessage === 'イメージマップ') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "imagemap",
          baseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/imagemap/rm001`,
          altText: "これはイメージマップです",
          baseSize: {
            width: 1040,
            height: 1040
          },
          video: {
            originalContentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/imagemap/rm001/video.mp4`,
            previewImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/imagemap/rm001/video_preview.jpg`,
            area: {
              x: 0,
              y: 228,
              width: 1040,
              height: 585
            },
            externalLink: {
              linkUri: "https://example.com/see_more.html",
              label: "もっと見る"
            }
          },
          actions: [
            {
              type: "uri",
              linkUri: "https://example.com/",
              area: {
                x: 0,
                y: 586,
                width: 520,
                height: 454
              }
            },
            {
              type: "message",
              text: "こんにちは",
              area: {
                x: 520,
                y: 586,
                width: 520,
                height: 454
              }
            }
          ]
        }
      ],
    };
    
    // 応答をログ出力（デバッグ用）
    console.log('イメージマップ送信リクエスト:', JSON.stringify(replyBody));
    
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
    
    // レスポンスをログ出力（デバッグ用）
    const responseText = await res.text();
    console.log('LINE API レスポンス:', responseText);
  }

  // 「ボタン」への応答
  if (userMessage === 'ボタン') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "template",
          altText: "これはボタンテンプレートです",
          template: {
            type: "buttons",
            thumbnailImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sample_image.jpg`,
            imageAspectRatio: "rectangle",
            imageSize: "cover",
            imageBackgroundColor: "#FFFFFF",
            title: "メニュー",
            text: "オプションを選択してください。",
            actions: [
              {
                type: "postback",
                label: "購入",
                data: "action=buy&itemid=123"
              },
              {
                type: "postback",
                label: "カートに追加",
                data: "action=add&itemid=123"
              },
              {
                type: "uri",
                label: "詳細を見る",
                uri: "http://example.com/page/123"
              }
            ]
          }
        }
      ]
    };
    
    // ボタン応答をログ出力（デバッグ用）
    console.log('ボタン送信リクエスト:', JSON.stringify(replyBody));
    
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
    
    // レスポンスをログ出力（デバッグ用）
    const buttonResponseText = await res.text();
    console.log('ボタン LINE API レスポンス:', buttonResponseText);
  }

  // 「確認ボタン」への応答
  if (userMessage === '確認ボタン') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "template",
          altText: "これは確認用のボタンテンプレートです",
          template: {
            type: "buttons",
            text: "本当に実行しますか？",
            actions: [
              {
                type: "message",
                label: "はい",
                text: "はい"
              },
              {
                type: "message",
                label: "いいえ",
                text: "いいえ"
              }
            ]
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「確認」への応答
  if (userMessage === '確認') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "template",
          altText: "これは確認テンプレートです",
          template: {
            type: "confirm",
            text: "本当に実行しますか？",
            actions: [
              {
                type: "message",
                label: "はい",
                text: "はい"
              },
              {
                type: "message",
                label: "いいえ",
                text: "いいえ"
              }
            ]
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「カルーセル」への応答
  if (userMessage === 'カルーセル') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "template",
          altText: "これはカルーセルテンプレートです",
          template: {
            type: "carousel",
            columns: [
              {
                thumbnailImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item1.jpg`,
                imageBackgroundColor: "#FFFFFF",
                title: "メニュー1",
                text: "説明1",
                defaultAction: {
                  type: "uri",
                  label: "詳細を見る",
                  uri: "http://example.com/page/123"
                },
                actions: [
                  {
                    type: "postback",
                    label: "購入",
                    data: "action=buy&itemid=111"
                  },
                  {
                    type: "postback",
                    label: "カートに追加",
                    data: "action=add&itemid=111"
                  },
                  {
                    type: "uri",
                    label: "詳細を見る",
                    uri: "http://example.com/page/111"
                  }
                ]
              },
              {
                thumbnailImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item2.jpg`,
                imageBackgroundColor: "#000000",
                title: "メニュー2",
                text: "説明2",
                defaultAction: {
                  type: "uri",
                  label: "詳細を見る",
                  uri: "http://example.com/page/222"
                },
                actions: [
                  {
                    type: "postback",
                    label: "購入",
                    data: "action=buy&itemid=222"
                  },
                  {
                    type: "postback",
                    label: "カートに追加",
                    data: "action=add&itemid=222"
                  },
                  {
                    type: "uri",
                    label: "詳細を見る",
                    uri: "http://example.com/page/222"
                  }
                ]
              }
            ],
            imageAspectRatio: "rectangle",
            imageSize: "cover"
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「画像カルーセル」への応答
  if (userMessage === '画像カルーセル') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "template",
          altText: "これは画像カルーセルテンプレートです",
          template: {
            type: "image_carousel",
            columns: [
              {
                imageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item1.jpg`,
                action: {
                  type: "postback",
                  label: "購入",
                  data: "action=buy&itemid=111"
                }
              },
              {
                imageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item2.jpg`,
                action: {
                  type: "message",
                  label: "はい",
                  text: "はい"
                }
              }
            ]
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「フレックス」への応答
  if (userMessage === 'フレックス') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これはFlexメッセージです",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "こんにちは"
                },
                {
                  type: "text",
                  text: "世界"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンテナバブル」への応答
  if (userMessage === 'コンテナバブル') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これはバブルメッセージです",
          contents: {
            type: "bubble",
            header: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "ヘッダーのテキスト"
                }
              ]
            },
            hero: {
              type: "image",
              url: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item1.jpg`
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "ボディのテキスト"
                }
              ]
            },
            footer: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "フッターのテキスト"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンテナカルーセル」への応答
  if (userMessage === 'コンテナカルーセル') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これはフレックスカルーセルです",
          contents: {
            type: "carousel",
            contents: [
              {
                type: "bubble",
                body: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "1つ目のバブル"
                    }
                  ]
                }
              },
              {
                type: "bubble",
                body: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "2つ目のバブル"
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンポーネントボックス」への応答
  if (userMessage === 'コンポーネントボックス') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これはボックスコンポーネントのサンプルです",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "image",
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item1.jpg`
                },
                {
                  type: "separator"
                },
                {
                  type: "text",
                  text: "ボックス内のテキスト"
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [],
                  width: "30px",
                  height: "30px",
                  background: {
                    type: "linearGradient",
                    angle: "90deg",
                    startColor: "#FFFF00",
                    endColor: "#0080ff"
                  }
                }
              ],
              height: "400px",
              justifyContent: "space-evenly",
              alignItems: "center"
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンポーネントボタン」への応答
  if (userMessage === 'コンポーネントボタン') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これはボタンコンポーネントのサンプルです",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "button",
                  action: {
                    type: "uri",
                    label: "タップしてね",
                    uri: "https://example.com"
                  },
                  style: "primary",
                  color: "#0000ff"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンポーネント画像」への応答
  if (userMessage === 'コンポーネント画像') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これは画像コンポーネントのサンプルです",
          contents: {
            type: "bubble",
            hero: {
              type: "image",
              url: "https://example.com/flex/images/image.jpg",
              size: "full",
              aspectRatio: "1.91:1"
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンポーネント動画」への応答
  if (userMessage === 'コンポーネント動画') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これは動画コンポーネントのサンプルです",
          contents: {
            type: "bubble",
            size: "mega",
            hero: {
              type: "video",
              url: `${process.env.NEXT_PUBLIC_APP_URL}/sample.mp4`,
              previewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/preview_image.jpg`,
              altContent: {
                type: "image",
                size: "full",
                aspectRatio: "20:13",
                aspectMode: "cover",
                url: `${process.env.NEXT_PUBLIC_APP_URL}/preview_image.jpg`
              },
              aspectRatio: "20:13"
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンポーネントアイコン」への応答
  if (userMessage === 'コンポーネントアイコン') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これはアイコンコンポーネントのサンプルです",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "baseline",
              contents: [
                {
                  type: "icon",
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/favicon.jpg`,
                  size: "md"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンポーネントテキスト」への応答
  if (userMessage === 'コンポーネントテキスト') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これはテキストコンポーネントのサンプルです",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "こんにちは、世界！",
                  size: "xl",
                  weight: "bold",
                  color: "#0000ff"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンポーネントスパン」への応答
  if (userMessage === 'コンポーネントスパン') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これはスパンコンポーネントのサンプルです",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "蛙",
                  size: "xxl",
                  weight: "bold",
                  style: "italic",
                  color: "#4f8f00"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンポーネントセパレータ」への応答
  if (userMessage === 'コンポーネントセパレータ') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これはセパレータコンポーネントのサンプルです",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "上のテキスト"
                },
                {
                  type: "separator",
                  color: "#000000"
                },
                {
                  type: "text",
                  text: "下のテキスト"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「コンポーネントフィラー」への応答
  if (userMessage === 'コンポーネントフィラー') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "これはフィラーコンポーネントのサンプルです",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "filler"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「カスタム」への応答
  if (userMessage === 'カスタム') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "Flex Messageの多機能サンプルカルーセル",
          contents: {
            type: "carousel",
            contents: [
              // 1. 画像＋ボタン
              {
                type: "bubble",
                hero: {
                  type: "image",
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item1.jpg`,
                  size: "full",
                  aspectRatio: "20:13",
                  aspectMode: "cover"
                },
                body: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    { type: "text", text: "画像＋ボタン", weight: "bold", size: "lg" },
                    { type: "button", action: { type: "uri", label: "詳細", uri: "https://example.com" }, style: "primary", color: "#1976D2" }
                  ]
                }
              },
              // 2. 画像＋スパンテキスト（動画の代替）
              {
                type: "bubble",
                hero: {
                  type: "image",
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item2.jpg`,
                  size: "full",
                  aspectRatio: "16:9",
                  aspectMode: "cover"
                },
                body: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      contents: [
                        { type: "span", text: "画像＋スパン", weight: "bold", color: "#388E3C" },
                        { type: "span", text: " Sample", style: "italic", color: "#1976D2" }
                      ],
                      wrap: true
                    },
                    { type: "button", action: { type: "uri", label: "リンク", uri: "https://example.com" }, style: "secondary" }
                  ]
                }
              },
              // 3. アイコン＋テキスト＋画像（hero）＋多要素
              {
                type: "bubble",
                hero: {
                  type: "image",
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item3.jpg`,
                  size: "full",
                  aspectRatio: "16:9",
                  aspectMode: "cover"
                },
                body: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    { type: "box", layout: "baseline", contents: [
                      { type: "icon", url: `${process.env.NEXT_PUBLIC_APP_URL}/favicon.jpg`, size: "md" },
                      { type: "text", text: "多要素バブル", weight: "bold", color: "#1976D2" }
                    ] },
                    { type: "text", text: "タイトルテキスト", size: "lg", weight: "bold", color: "#388E3C", margin: "md" },
                    { type: "separator", color: "#1976D2", margin: "md" },
                    { type: "text", text: "説明文がここに入ります。", size: "sm", color: "#333333", margin: "md" },
                    { type: "box", layout: "horizontal", contents: [
                      { type: "button", action: { type: "uri", label: "Webサイト", uri: "https://example.com" }, style: "primary", color: "#1976D2", flex: 2 },
                      { type: "button", action: { type: "message", label: "メッセージ", text: "メッセージ送信" }, style: "secondary", color: "#388E3C", flex: 1 }
                    ], margin: "md", spacing: "md" },
                    { type: "text", text: "補足情報", size: "xs", color: "#888888", margin: "md" }
                  ]
                },
                footer: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    { type: "button", action: { type: "postback", label: "ポストバック", data: "action=postback&item=3" }, style: "primary", color: "#FBC02D" },
                    { type: "text", text: "フッターの説明", size: "xs", color: "#1976D2", margin: "md" }
                  ]
                }
              },
              // 5. セパレータ＋テキスト＋header/footer＋多様なボタン
              {
                type: "bubble",
                header: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    { type: "text", text: "ボタン網羅例", weight: "bold", color: "#D32F2F" }
                  ]
                },
                body: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    { type: "text", text: "上のテキスト" },
                    { type: "separator", color: "#000000" },
                    { type: "text", text: "下のテキスト" },
                    { type: "button", action: { type: "postback", label: "ポストバック", data: "action=postback&item=5" }, style: "primary", margin: "md" },
                    { type: "button", action: { type: "uri", label: "Google", uri: "https://google.com" }, style: "secondary", margin: "md" },
                    { type: "button", action: { type: "message", label: "メッセージ", text: "ボタン押下" }, style: "primary", margin: "md" },
                    { type: "button", action: { type: "postback", label: "追加", data: "action=add&item=5" }, style: "secondary", margin: "md" }
                  ]
                },
                footer: {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "button", action: { type: "uri", label: "Yahoo", uri: "https://yahoo.co.jp" }, style: "secondary", color: "#FBC02D" },
                    { type: "button", action: { type: "message", label: "LINE", text: "LINEへ" }, style: "primary", color: "#388E3C" }
                  ]
                }
              },
              // 6. フィラー＋ボタン＋header/footer＋テキスト
              {
                type: "bubble",
                header: {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "text", text: "フィラー例", weight: "bold", color: "#388E3C" }
                  ]
                },
                body: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    { type: "filler" },
                    { type: "button", action: { type: "message", label: "押して", text: "押されました" }, style: "secondary" },
                    { type: "filler" },
                    { type: "text", text: "フィラーで上下スペース", size: "sm", color: "#888888", margin: "md" }
                  ]
                },
                footer: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    { type: "text", text: "フッターのテキスト", size: "xs", color: "#1976D2" }
                  ]
                }
              },
              // 7. グラデーション背景ボックス
              {
                type: "bubble",
                body: {
                  type: "box",
                  layout: "vertical",
                  background: {
                    type: "linearGradient",
                    angle: "90deg",
                    startColor: "#FFEB3B",
                    endColor: "#1976D2"
                  },
                  contents: [
                    { type: "text", text: "グラデーション背景", color: "#FFFFFF", weight: "bold" },
                    { type: "text", text: "このバブルはグラデーション背景です。", color: "#1976D2", margin: "md" },
                    { type: "button", action: { type: "uri", label: "公式サイト", uri: "https://example.com" }, style: "primary", color: "#1976D2", margin: "md" }
                  ],
                  paddingAll: "20px"
                }
              },
              // 8. 角丸・枠線・padding＋header/footer＋ボタン
              {
                type: "bubble",
                header: {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "text", text: "角丸・枠線", weight: "bold", color: "#1976D2" }
                  ]
                },
                body: {
                  type: "box",
                  layout: "vertical",
                  backgroundColor: "#F5F5F5",
                  borderColor: "#1976D2",
                  borderWidth: "medium",
                  cornerRadius: "xl",
                  contents: [
                    { type: "text", text: "角丸・枠線・余白", color: "#1976D2", weight: "bold" },
                    { type: "button", action: { type: "uri", label: "Google", uri: "https://google.com" }, style: "primary", color: "#388E3C", margin: "md" }
                  ],
                  paddingAll: "24px"
                },
                footer: {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "button", action: { type: "uri", label: "Yahoo", uri: "https://yahoo.co.jp" }, style: "secondary", color: "#FBC02D" }
                  ]
                }
              },
              // 9. 水平ボックス＋複数ボタン＋header/footer＋テキスト
              {
                type: "bubble",
                header: {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "text", text: "水平ボックス", weight: "bold", color: "#388E3C" }
                  ]
                },
                body: {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "button", action: { type: "uri", label: "A", uri: "https://a.com" }, style: "primary", color: "#388E3C" },
                    { type: "button", action: { type: "uri", label: "B", uri: "https://b.com" }, style: "secondary", color: "#FBC02D" }
                  ]
                },
                footer: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    { type: "text", text: "フッターのテキスト", size: "xs", color: "#1976D2" }
                  ]
                }
              },
              // 10. テキストのみ・色・サイズ・weight＋header/footer＋ボタン
              {
                type: "bubble",
                header: {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "text", text: "テキスト例", weight: "bold", color: "#D32F2F" }
                  ]
                },
                body: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    { type: "text", text: "大きな太字", size: "xxl", weight: "bold", color: "#D32F2F" },
                    { type: "text", text: "小さな細字", size: "sm", weight: "regular", color: "#1976D2" },
                    { type: "button", action: { type: "message", label: "テスト送信", text: "テスト" }, style: "primary", color: "#1976D2", margin: "md" }
                  ]
                },
                footer: {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "button", action: { type: "uri", label: "LINE", uri: "https://line.me" }, style: "secondary", color: "#388E3C" }
                  ]
                }
              },
              // 11. ボックス入れ子・justify/align＋header/footer＋ボタン
              {
                type: "bubble",
                header: {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "text", text: "入れ子ボックス", weight: "bold", color: "#1976D2" }
                  ]
                },
                body: {
                  type: "box",
                  layout: "vertical",
                  justifyContent: "center",
                  alignItems: "center",
                  contents: [
                    {
                      type: "box",
                      layout: "horizontal",
                      backgroundColor: "#E3F2FD",
                      cornerRadius: "md",
                      contents: [
                        { type: "text", text: "入れ子ボックス", color: "#1976D2", align: "center" }
                      ],
                      paddingAll: "10px"
                    },
                    { type: "button", action: { type: "uri", label: "公式サイト", uri: "https://example.com" }, style: "primary", color: "#1976D2", margin: "md" }
                  ],
                  height: "120px"
                },
                footer: {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "button", action: { type: "uri", label: "ヘルプ", uri: "https://help.line.me" }, style: "secondary", color: "#388E3C" }
                  ]
                }
              }
            ]
          }
        }
      ]
    };
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
    console.log('LINE reply response:', await res.text());
  }

  // 「カスタム画像ボタン」への応答
  if (userMessage === 'カスタム画像ボタン') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "イベント告知メッセージ",
          contents: {
            type: "bubble",
            hero: {
              type: "image",
              url: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item1.jpg`,
              size: "full",
              aspectRatio: "20:13",
              aspectMode: "cover"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "緊急ですが…\n本日21時から\nスペシャルライブをやります！",
                  weight: "bold",
                  size: "md",
                  align: "center",
                  wrap: true,
                  color: "#333333"
                },
                {
                  type: "separator",
                  margin: "md"
                },
                {
                  type: "text",
                  text: '①緊急スペシャルライブ\nテーマは\n質問"全回答"\n※コメントの質問に全部答えます',
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "text",
                  text: "さらに追加で…\n②【1Day開催】サービス説明会\n4/14(月) 14時開始です",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "box",
                  layout: "vertical",
                  margin: "md",
                  backgroundColor: "#F5F5F5",
                  cornerRadius: "md",
                  paddingAll: "10px",
                  contents: [
                    {
                      type: "text",
                      text: "すでに多くの方が参加し、豊富なコンテンツや参加者限定のウェビナーなど、すべてを受け取り、新たなチャレンジをスタートしています‼️",
                      size: "sm",
                      wrap: true,
                      color: "#444444"
                    }
                  ]
                },
                {
                  type: "text",
                  text: "説明会では\nプログラムや講座の内容について\n具体的にお話しさせていただきます",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "text",
                  text: "【大事なのはセット参加！】\n本日のライブで疑問を解消し、14日の説明会で全貌をチェックしてください！",
                  margin: "md",
                  wrap: true,
                  color: "#D32F2F",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: "2025年、早くもラストチャンスです\n＼説明会予約の確保はこちら／",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                }
              ]
            },
            footer: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "button",
                  action: {
                    type: "uri",
                    label: "▶4/14 14時の説明会に申し込む",
                    uri: "https://example.com/apply"
                  },
                  style: "primary",
                  color: "#1976D2"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「カスタム画像ボタン大」への応答
  if (userMessage === 'カスタム画像ボタン大') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "大きな画像とボタンのリッチメッセージです",
          contents: {
            type: "bubble",
            size: "giga",
            hero: {
              type: "image",
              url: `${process.env.NEXT_PUBLIC_APP_URL}/sample_item1.jpg`,
              size: "full",
              aspectRatio: "2:1",
              aspectMode: "cover"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "緊急ですが…\n本日21時から\nスペシャルライブをやります！",
                  weight: "bold",
                  size: "xl",
                  align: "center",
                  wrap: true,
                  color: "#333333"
                },
                {
                  type: "separator",
                  margin: "md"
                },
                {
                  type: "text",
                  text: '①緊急スペシャルライブ\nテーマは\n質問"全回答"\n※コメントの質問に全部答えます',
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "text",
                  text: "さらに追加で…\n②【1Day開催】サービス説明会\n4/14(月) 14時開始です",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "box",
                  layout: "vertical",
                  margin: "md",
                  backgroundColor: "#F5F5F5",
                  cornerRadius: "md",
                  paddingAll: "10px",
                  contents: [
                    {
                      type: "text",
                      text: "すでに多くの方が参加し、豊富なコンテンツや参加者限定のウェビナーなど、すべてを受け取り、新たなチャレンジをスタートしています‼️",
                      size: "sm",
                      wrap: true,
                      color: "#444444"
                    }
                  ]
                },
                {
                  type: "text",
                  text: "説明会では\nプログラムや講座の内容について\n具体的にお話しさせていただきます",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "text",
                  text: "【大事なのはセット参加！】\n本日のライブで疑問を解消し、14日の説明会で全貌をチェックしてください！",
                  margin: "md",
                  wrap: true,
                  color: "#D32F2F",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: "2025年、早くもラストチャンスです\n＼説明会予約の確保はこちら／",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                }
              ]
            },
            footer: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "button",
                  action: {
                    type: "uri",
                    label: "▶4/14 14時の説明会に申し込む",
                    uri: "https://example.com/apply"
                  },
                  style: "primary",
                  color: "#1976D2"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「カスタム動画ボタン」への応答
  if (userMessage === 'カスタム動画ボタン') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "イベント告知メッセージ",
          contents: {
            type: "bubble",
            size: "mega",
            hero: {
              type: "video",
              url: `${process.env.NEXT_PUBLIC_APP_URL}/sample.mp4`,
              previewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/preview_image.jpg`,
              altContent: {
                type: "image",
                url: `${process.env.NEXT_PUBLIC_APP_URL}/preview_image.jpg`,
                size: "full",
                aspectRatio: "16:9",
                aspectMode: "cover"
              },
              aspectRatio: "16:9"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "緊急ですが…\n本日21時から\nスペシャルライブをやります！",
                  weight: "bold",
                  size: "md",
                  align: "center",
                  wrap: true,
                  color: "#333333"
                },
                {
                  type: "separator",
                  margin: "md"
                },
                {
                  type: "text",
                  text: '①緊急スペシャルライブ\nテーマは\n質問"全回答"\n※コメントの質問に全部答えます',
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "text",
                  text: "さらに追加で…\n②【1Day開催】サービス説明会\n4/14(月) 14時開始です",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "box",
                  layout: "vertical",
                  margin: "md",
                  backgroundColor: "#F5F5F5",
                  cornerRadius: "md",
                  paddingAll: "10px",
                  contents: [
                    {
                      type: "text",
                      text: "すでに多くの方が参加し、豊富なコンテンツや参加者限定のウェビナーなど、すべてを受け取り、新たなチャレンジをスタートしています‼️",
                      size: "sm",
                      wrap: true,
                      color: "#444444"
                    }
                  ]
                },
                {
                  type: "text",
                  text: "説明会では\nプログラムや講座の内容について\n具体的にお話しさせていただきます",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "text",
                  text: "【大事なのはセット参加！】\n本日のライブで疑問を解消し、14日の説明会で全貌をチェックしてください！",
                  margin: "md",
                  wrap: true,
                  color: "#D32F2F",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: "2025年、早くもラストチャンスです\n＼説明会予約の確保はこちら／",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                }
              ]
            },
            footer: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "button",
                  action: {
                    type: "uri",
                    label: "▶4/14 14時の説明会に申し込む",
                    uri: "https://example.com/apply"
                  },
                  style: "primary",
                  color: "#1976D2"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「カスタム動画ボタン大」への応答
  if (userMessage === 'カスタム動画ボタン大') {
    const replyBody = {
      replyToken: replyToken,
      messages: [
        {
          type: "flex",
          altText: "大きな画像とボタンのリッチメッセージです",
          contents: {
            type: "bubble",
            size: "giga",
            hero: {
              type: "video",
              url: `${process.env.NEXT_PUBLIC_APP_URL}/sample.mp4`,
              previewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/preview_image.jpg`,
              altContent: {
                type: "image",
                url: `${process.env.NEXT_PUBLIC_APP_URL}/preview_image.jpg`,
                size: "full",
                aspectRatio: "16:9",
                aspectMode: "cover"
              },
              aspectRatio: "16:9"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "緊急ですが…\n本日21時から\nスペシャルライブをやります！",
                  weight: "bold",
                  size: "xl",
                  align: "center",
                  wrap: true,
                  color: "#333333"
                },
                {
                  type: "separator",
                  margin: "md"
                },
                {
                  type: "text",
                  text: '①緊急スペシャルライブ\nテーマは\n質問"全回答"\n※コメントの質問に全部答えます',
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "text",
                  text: "さらに追加で…\n②【1Day開催】サービス説明会\n4/14(月) 14時開始です",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "box",
                  layout: "vertical",
                  margin: "md",
                  backgroundColor: "#F5F5F5",
                  cornerRadius: "md",
                  paddingAll: "10px",
                  contents: [
                    {
                      type: "text",
                      text: "すでに多くの方が参加し、豊富なコンテンツや参加者限定のウェビナーなど、すべてを受け取り、新たなチャレンジをスタートしています‼️",
                      size: "sm",
                      wrap: true,
                      color: "#444444"
                    }
                  ]
                },
                {
                  type: "text",
                  text: "説明会では\nプログラムや講座の内容について\n具体的にお話しさせていただきます",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                },
                {
                  type: "text",
                  text: "【大事なのはセット参加！】\n本日のライブで疑問を解消し、14日の説明会で全貌をチェックしてください！",
                  margin: "md",
                  wrap: true,
                  color: "#D32F2F",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: "2025年、早くもラストチャンスです\n＼説明会予約の確保はこちら／",
                  margin: "md",
                  wrap: true,
                  color: "#222222"
                }
              ]
            },
            footer: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "button",
                  action: {
                    type: "uri",
                    label: "▶4/14 14時の説明会に申し込む",
                    uri: "https://example.com/apply"
                  },
                  style: "primary",
                  color: "#1976D2"
                }
              ]
            }
          }
        }
      ]
    };
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyBody),
    });
  }

  // 「リッチメニュー一覧」への応答
  if (userMessage === 'リッチメニュー一覧') {
    try {
      const aliasData = await listRichMenuAliases(LINE_CHANNEL_ACCESS_TOKEN);
      const menuData = await listRichMenus(LINE_CHANNEL_ACCESS_TOKEN);
      let aliasText = '【リッチメニューエイリアス一覧】\n';
      if (Array.isArray(aliasData.aliases) && aliasData.aliases.length > 0) {
        aliasText += aliasData.aliases.map((a: any) => `・${a.richMenuAliasId} → ${a.richMenuId}`).join('\n');
      } else {
        aliasText += 'なし';
      }
      let menuText = '\n\n【リッチメニュー一覧】\n';
      if (Array.isArray(menuData.richmenus) && menuData.richmenus.length > 0) {
        menuText += menuData.richmenus.map((m: any) => `・${m.richMenuId}（${m.name} / ${m.chatBarText}）`).join('\n');
      } else {
        menuText += 'なし';
      }
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: aliasText + menuText,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューエイリアス一覧の取得に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニュー1」への応答
  if (userMessage === 'リッチメニュー1') {
    try {
      await setupRichMenu1ForUser(userId, LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニュー1を設定しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニュー1の設定に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニュー2」への応答
  if (userMessage === 'リッチメニュー2') {
    try {
      await setupRichMenu2ForUser(userId, LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニュー2を設定しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニュー2の設定に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニュー3」への応答
  if (userMessage === 'リッチメニュー3') {
    try {
      await setupRichMenu3ForUser(userId, LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニュー3を設定しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニュー3の設定に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニュー全消去」への応答
  if (userMessage === 'リッチメニュー全消去') {
    try {
      const result = await deleteAllRichMenus(LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `リッチメニューを${result.deleted}件削除しました。`,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニュー全消去に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニュー1作成」への応答
  if (userMessage === 'リッチメニュー1作成') {
    try {
      const result = await createRichMenu1(LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `リッチメニュー1を作成しました。ID: ${result.richMenuId}`,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニュー1の作成に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニュー2作成」への応答
  if (userMessage === 'リッチメニュー2作成') {
    try {
      const result = await createRichMenu2(LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `リッチメニュー2を作成しました。ID: ${result.richMenuId}`,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニュー2の作成に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニュー3作成」への応答
  if (userMessage === 'リッチメニュー3作成') {
    try {
      const result = await createRichMenu3(LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `リッチメニュー3を作成しました。ID: ${result.richMenuId}`,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニュー3の作成に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニューA作成」への応答
  if (userMessage === 'リッチメニューA作成') {
    try {
      const result = await createRichMenuA(LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `リッチメニューAを作成しました。ID: ${result.richMenuId}`,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      console.error('リッチメニューA作成エラー:', err);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューAの作成に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニューB作成」への応答
  if (userMessage === 'リッチメニューB作成') {
    try {
      const result = await createRichMenuB(LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `リッチメニューBを作成しました。ID: ${result.richMenuId}`,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      console.error('リッチメニューB作成エラー:', err);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューBの作成に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニューA」への応答
  if (userMessage === 'リッチメニューA') {
    try {
      await setupRichMenuAForUser(userId, LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューAを設定しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューAの設定に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニューB」への応答
  if (userMessage === 'リッチメニューB') {
    try {
      await setupRichMenuBForUser(userId, LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューBを設定しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューBの設定に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニューエイリアスA作成」への応答
  if (userMessage === 'リッチメニューエイリアスA作成') {
    try {
      const result = await createRichMenuAliasA(LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `リッチメニューエイリアスAを作成しました。\nエイリアスID: ${result.richMenuAliasId}\nリッチメニューID: ${result.richMenuId}`,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューエイリアスAの作成に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニューエイリアスB作成」への応答
  if (userMessage === 'リッチメニューエイリアスB作成') {
    try {
      const result = await createRichMenuAliasB(LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `リッチメニューエイリアスBを作成しました。\nエイリアスID: ${result.richMenuAliasId}\nリッチメニューID: ${result.richMenuId}`,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューエイリアスBの作成に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニューエイリアスA更新」への応答
  if (userMessage === 'リッチメニューエイリアスA更新') {
    try {
      const result = await updateRichMenuAliasA(LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `リッチメニューエイリアスAを更新しました。\nエイリアスID: ${result.richMenuAliasId}\nリッチメニューID: ${result.richMenuId}`,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューエイリアスAの更新に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // 「リッチメニューエイリアスB更新」への応答
  if (userMessage === 'リッチメニューエイリアスB更新') {
    try {
      const result = await updateRichMenuAliasB(LINE_CHANNEL_ACCESS_TOKEN);
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `リッチメニューエイリアスBを更新しました。\nエイリアスID: ${result.richMenuAliasId}\nリッチメニューID: ${result.richMenuId}`,
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    } catch (err) {
      const replyBody = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'リッチメニューエイリアスBの更新に失敗しました。',
          },
        ],
      };
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(replyBody),
      });
      return true;
    }
  }

  // どちらでもなければ何もしない
  return false;
}
