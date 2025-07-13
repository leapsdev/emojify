# IPFSストレージをthirdweb sdkからPinata SDKへ移行するタスク

## 概要
本プロジェクトでは、これまでthirdweb sdkのstorage機能を用いてIPFSへのファイル・メタデータのアップロードを行っていました。今後は、IPFS関連の処理のみPinata SDKへ移行し、コントラクト操作は引き続きthirdweb sdkを利用します。

---

## タスク一覧

1. **Pinata SDKの導入**
    - `pnpm add pinata` でパッケージを追加する。

2. **環境変数の追加**
    - `.env`ファイルに以下を追加し、セキュアに管理する。
      - `PINATA_JWT` : PinataのJWTトークン
      - `PINATA_GATEWAY` : PinataのゲートウェイURL（例: `example-gateway.mypinata.cloud`）

3. **thirdweb storage依存部分の削除**
    - `@thirdweb-dev/storage`のimportや初期化コードを削除。
    - 例: `src/components/features/create-emoji/hooks/useIPFS.ts` など

4. **Pinata SDKによるアップロード・取得処理の実装**
    - Pinata SDKの初期化（JWTとGatewayを利用）
    - ファイルアップロード: `pinata.upload.public.file(file)`
    - メタデータアップロード: `pinata.upload.public.json(metadata)`
    - 必要に応じて型やエラーハンドリングも統一感を持って実装

5. **IPFSゲートウェイURL変換処理の調整**
    - `ipfsToHttp`等の関数で、Pinataのゲートウェイを優先的に利用するように修正
    - 例: `https://<PINATA_GATEWAY>/ipfs/<cid>`

6. **既存のIPFS利用箇所の一括置換・動作確認**
    - 画像アップロード、メタデータアップロード、取得処理がすべてPinata経由となるように修正
    - コードスタイル・エラーハンドリング・型定義も既存実装に合わせて統一

---

## 動作確認について
- 動作確認・テスト（NFT作成・画像アップロード・メタデータ取得など）は、**人による目視・手動確認**で行ってください。
- 必要に応じてユニットテストやE2Eテストを追加しても構いません。

---

## 参考実装例

```ts
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
});

// ファイルアップロード
const uploadToIPFS = async (file: File): Promise<string> => {
  const result = await pinata.upload.public.file(file);
  return `ipfs://${result.cid}`;
};

// メタデータアップロード
const uploadMetadataToIPFS = async (metadata: object): Promise<string> => {
  const result = await pinata.upload.public.json(metadata);
  return `ipfs://${result.cid}`;
};

// IPFS→HTTP変換（Pinata優先）
const ipfsToHttp = (ipfsUrl: string) => {
  const hash = ipfsUrl.replace('ipfs://', '');
  return `https://${process.env.PINATA_GATEWAY}/ipfs/${hash}`;
};
```

---

## 注意事項
- JWTやGateway情報は絶対に公開リポジトリに含めないこと。
- コードの型・エラーハンドリング・命名規則は既存実装に合わせて統一すること。
- コントラクト操作部分（thirdweb sdk）は変更不要。

---

## 完了条件
- すべてのIPFSアップロード・取得処理がPinata SDK経由となっている
- 人による動作確認・テストが完了している
- コードの統一感・可読性が保たれている 