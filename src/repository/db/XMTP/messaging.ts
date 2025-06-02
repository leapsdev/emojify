import type {
  Client,
  DecodedMessage,
  Group,
  StreamCallback,
} from '@xmtp/browser-sdk';

// 1対1のDM作成
export async function createDirectMessage(
  client: Client,
  recipientAddress: string,
) {
  try {
    const conversation = await client.conversations.newDm(recipientAddress);
    return conversation;
  } catch (error) {
    console.error('DMの作成に失敗しました:', error);
    throw error;
  }
}

// メッセージ送信
export async function sendMessage(
  group: Group<string>,
  content: string,
): Promise<void> {
  try {
    await group.send(content);
  } catch (error) {
    console.error('メッセージの送信に失敗しました:', error);
    throw error;
  }
}

// メッセージ履歴取得
export async function getMessages(
  group: Group<string>,
): Promise<DecodedMessage<string>[]> {
  try {
    const messages = await group.messages();
    return messages;
  } catch (error) {
    console.error('メッセージの取得に失敗しました:', error);
    throw error;
  }
}

// メッセージのストリーミング
export function streamMessages(
  group: Group<string>,
  callback: (message: DecodedMessage<string>) => void,
): void {
  try {
    const streamCallback: StreamCallback<DecodedMessage<string>> = (
      message,
      err,
    ) => {
      if (err) {
        console.error(
          'メッセージのストリーミング中にエラーが発生しました:',
          err,
        );
        return;
      }
      if (message) {
        callback(message as unknown as DecodedMessage<string>);
      }
    };
    group.stream(streamCallback);
  } catch (error) {
    console.error('メッセージのストリーミングに失敗しました:', error);
    throw error;
  }
}
