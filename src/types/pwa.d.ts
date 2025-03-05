interface BeforeInstallPromptEvent extends Event {
  /**
   * プロンプトを表示するメソッド
   */
  prompt(): Promise<void>;

  /**
   * ユーザーの選択結果
   */
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
}
