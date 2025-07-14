# thirdwebからwagmiへの移行タスク

本プロジェクトにおけるthirdweb依存を完全に排除し、wagmiへ統一するためのタスク一覧です。
すべてpnpmを使用し、既存の設計・構成に統一感を持たせることを重視しています。

---

## タスク一覧

- **[pending] [id:remove-thirdweb-add-wagmi] thirdwebの依存パッケージをアンインストールし、wagmi関連パッケージをpnpmでインストールする**
  - @thirdweb-dev/react, @thirdweb-dev/sdk, thirdweb などを削除
  - wagmi, @wagmi/core, @wagmi/connectors, viem などを追加
  - 依存なし

- **[pending] [id:replace-provider] 全コンポーネントからThirdwebProviderを削除し、EthereumProviders（WagmiProvider/QueryClientProvider）に統一する**
  - src/lib/basename/EthereumProviders.tsx を全体のProviderとして利用
  - 依存: remove-thirdweb-add-wagmi

- **[pending] [id:replace-contract-logic] thirdwebのコントラクト操作ロジックをwagmiのuseReadContract, useWriteContract, useAccount等に置き換える**
  - getContract, prepareContractCall, sendTransaction, useContract, useContractRead, useContractWrite などを全て置換
  - 依存: replace-provider

- **[pending] [id:rewrite-custom-hooks] thirdweb依存のカスタムフック（例: useThirdwebMint.ts）をwagmi用に書き換える**
  - 依存: replace-contract-logic

- **[pending] [id:rewrite-collect-components] thirdweb依存のコンポーネント（例: CollectButton.tsx）をwagmi用に書き換える**
  - 依存: replace-contract-logic

- **[pending] [id:rewrite-nft-hooks] NFT取得ロジック（useExploreNFTs.ts, useProfileNFTs.ts等）をthirdwebからwagmiに置き換える**
  - 依存: replace-contract-logic

- **[pending] [id:remove-thirdweb-utils] thirdweb依存のimportやユーティリティ（src/lib/thirdweb.ts等）を削除し、コントラクト情報（ABI, アドレス）は新たな共通ファイル（例: src/lib/contracts.ts）にまとめる**
  - 依存: rewrite-custom-hooks, rewrite-collect-components, rewrite-nft-hooks

- **[pending] [id:update-readme-env] READMEからthirdweb関連の記述を削除し、wagmi用の説明に更新する**
  - 依存: remove-thirdweb-utils

---

このタスクリストに沿って順番に作業を進めれば、プロジェクト全体を統一的にthirdwebからwagmiへ移行できます。
着手する際は、最初のタスクから「in_progress」に変更してください。 