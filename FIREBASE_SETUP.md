# Firebase認証セットアップガイド

## 概要
このプロジェクトでは、PrivyとFirebaseを使用したカスタム認証システムを実装しています。

## 必要な環境変数

### 1. Privy設定
```bash
# .env.local ファイルに追加
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_app_secret_here
```

### 2. Firebase設定（クライアント）
```bash
# .env.local ファイルに追加
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Firebase Admin設定（サーバー）
```bash
# .env.local ファイルに追加
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

## 設定手順

### 1. Privyプロジェクトの設定
1. [Privy Console](https://console.privy.io/) でプロジェクトを作成
2. App IDとApp Secretを取得
3. 認証方法を設定（ウォレット、Farcaster、メール）

### 2. Firebaseプロジェクトの設定
1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Authenticationを有効化
3. Realtime Databaseを有効化
4. サービスアカウントキーを生成

### 3. Google Cloud Platformの設定
1. IAM Service Account Credentials APIを有効化
2. サービスアカウントに以下の権限を付与：
   - `iam.serviceAccounts.signBlob`
   - `firebase.admin`

### 4. 環境変数の設定
1. プロジェクトルートに`.env.local`ファイルを作成
2. 上記の環境変数を適切な値で設定

## トラブルシューティング

### よくあるエラー

#### 1. "Firebaseトークンの取得に失敗しました"
- 環境変数が正しく設定されているか確認
- Firebase Admin SDKの初期化が成功しているか確認
- サービスアカウントの権限を確認

#### 2. "Privyアクセストークンの取得に失敗しました"
- Privyの設定が正しいか確認
- ウォレット接続が正常か確認
- Farcaster認証が正常か確認

#### 3. 401 Unauthorizedエラー
- Authorizationヘッダーが正しく送信されているか確認
- Privyトークンが有効か確認
- CORS設定が正しいか確認

### デバッグ方法
1. ブラウザの開発者ツールでネットワークタブを確認
2. サーバーサイドのログを確認
3. 環境変数が正しく読み込まれているか確認

## セキュリティ注意事項
- `.env.local`ファイルはGitにコミットしない
- 本番環境では適切なシークレット管理を使用
- Firebase Admin SDKの秘密鍵は安全に管理
- CORS設定は本番環境で適切に制限
