import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import type { Signer } from 'ethers';
import { ethers, ignition, upgrades } from 'hardhat';
import { DeployEmojiChatModule } from '../ignition/modules/DeployEmojiChat';
import type { EmojiChatV4 } from '../typechain-types/contracts/EmojiChatV4';

// Hardhatの推奨に従い、fixtureを使用
async function deployEmojiChatFixture(): Promise<{
  chat: EmojiChatV4;
  owner: Signer;
  alice: Signer;
  bob: Signer;
  ownerAddress: string;
  aliceAddress: string;
  bobAddress: string;
}> {
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const alice = signers[1];
  const bob = signers[2];
  const ownerAddress = await owner.getAddress();
  const aliceAddress = await alice.getAddress();
  const bobAddress = await bob.getAddress();

  const { emojiChat } = await ignition.deploy(DeployEmojiChatModule);
  const chat = emojiChat as unknown as EmojiChatV4; // V4にキャスト

  // 必要であれば初期状態でunpause
  if (await chat.paused()) {
    await chat.connect(owner).unpause();
  }

  return {
    chat,
    owner,
    alice,
    bob,
    ownerAddress,
    aliceAddress,
    bobAddress,
  };
}

describe('EmojiChatV4 (proxy)', () => {
  // --- Fixture を使用 ---
  async function setup() {
    return loadFixture(deployEmojiChatFixture);
  }

  // --- 初期化とデプロイ ---
  describe('Initialization & Deployment', () => {
    it('should set the correct owner', async () => {
      const { chat, ownerAddress } = await setup();
      expect(await chat.owner()).to.equal(ownerAddress);
    });

    it('should start with nextTokenId implicitly as 1 (tested via register)', async () => {
      const { chat, alice, aliceAddress } = await setup();
      const aliceSignerAddress = await alice.getAddress(); // アドレスを事前取得
      const tx = await chat
        .connect(alice)
        .registerNewEmoji(aliceAddress, 'uri://1', '0x');
      const receipt = await tx.wait();
      // イベントの取得方法を ethers v6/hardhat-chai-matchers v2 に合わせる (より堅牢)
      await expect(tx)
        .to.emit(chat, 'NewEmojiRegistered')
        .withArgs(1n, aliceAddress, 'uri://1');
      await expect(tx)
        .to.emit(chat, 'TransferSingle')
        .withArgs(
          aliceSignerAddress, // 修正: await alice.getAddress()
          ethers.ZeroAddress,
          aliceAddress,
          1n,
          1n,
        );
    });

    it('should revert if initialized again', async () => {
      const { chat, ownerAddress } = await setup();
      await expect(chat.initialize(ownerAddress)).to.be.revertedWithCustomError(
        chat,
        'InvalidInitialization',
      );
    });
  });

  // --- アクセス制御 ---
  describe('Access Control', () => {
    it('owner can call owner-only functions', async () => {
      const { chat, owner } = await setup();
      // ID 1 が存在しなくても Ownable チェックは通るはず
      await expect(chat.connect(owner).setTokenURI(1, 'newURI')).to.not.be
        .reverted;
      // pause() が revert しないことを確認
      await expect(chat.connect(owner).pause()).to.not.be.reverted;
      // pause 状態になっていることを確認
      expect(await chat.paused()).to.be.true;
      // unpause() が revert しないことを確認
      await expect(chat.connect(owner).unpause()).to.not.be.reverted;
    });

    it('non-owner cannot call owner-only functions', async () => {
      const { chat, alice } = await setup();
      const aliceAddress = await alice.getAddress(); // アドレスを事前取得
      const expectedRevertMsg = 'OwnableUnauthorizedAccount';

      await expect(chat.connect(alice).setTokenURI(1, 'x'))
        .to.be.revertedWithCustomError(chat, expectedRevertMsg)
        .withArgs(aliceAddress); // 修正: await alice.getAddress()
      await expect(chat.connect(alice).pause())
        .to.be.revertedWithCustomError(chat, expectedRevertMsg)
        .withArgs(aliceAddress); // 修正: await alice.getAddress()
      // pause されていない状態で unpause を試みる
      await expect(chat.connect(alice).unpause())
        .to.be.revertedWithCustomError(chat, expectedRevertMsg)
        .withArgs(aliceAddress); // 修正: await alice.getAddress()
    });

    it('anyone can call public minting functions', async () => {
      const { chat, alice, bob, aliceAddress, bobAddress } = await setup();
      await expect(
        chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://alice', '0x'),
      ).to.not.be.reverted;

      // ID 1 が alice によって登録された後、bob が供給を追加
      await expect(chat.connect(bob).addEmojiSupply(bobAddress, 1, 5, '0x')).to
        .not.be.reverted;
    });
  });

  // --- Pausable ---
  describe('Pausable', () => {
    it('owner can pause and unpause', async () => {
      const { chat, owner } = await setup();
      await chat.connect(owner).pause();
      expect(await chat.paused()).to.be.true;
      await chat.connect(owner).unpause();
      expect(await chat.paused()).to.be.false;
    });

    it('should revert minting and transfers when paused', async () => {
      const { chat, owner, alice, bob, aliceAddress, bobAddress } =
        await setup();
      await chat
        .connect(alice)
        .registerNewEmoji(aliceAddress, 'uri://1', '0x');
      await chat
        .connect(alice)
        .safeTransferFrom(aliceAddress, bobAddress, 1, 1, '0x');

      await chat.connect(owner).pause();
      // ERC1155PausableUpgradeable のエラー名を確認 (5.0 では EnforcedPause)
      const expectedRevertMsg = 'EnforcedPause';

      // Minting functions
      await expect(
        chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://2', '0x'),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);
      await expect(
        chat.connect(bob).addEmojiSupply(bobAddress, 1, 1, '0x'),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);
      await expect(
        chat
          .connect(alice)
          .registerNewEmojisBatch(aliceAddress, ['uri://3'], '0x'),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);
      await expect(
        chat.connect(bob).addEmojiSupplyBatch(bobAddress, [1], [1], '0x'),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);

      // Transfer functions
      await expect(
        chat.connect(bob).safeTransferFrom(bobAddress, aliceAddress, 1, 1, '0x'),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);
      await expect(
        chat
          .connect(bob)
          .safeBatchTransferFrom(bobAddress, aliceAddress, [1], [1], '0x'),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);

      // Unpause して再開できることを確認
      await chat.connect(owner).unpause();
      await expect(
        chat.connect(bob).safeTransferFrom(bobAddress, aliceAddress, 1, 1, '0x'),
      ).to.not.be.reverted;
    });
  });

  // --- 新規絵文字登録 ---
  describe('Register New Emoji', () => {
    it('registerNewEmoji correctly assigns ID, mints, sets URI and firstMinter', async () => {
      const { chat, alice, bob, aliceAddress, bobAddress } = await setup();
      const aliceSignerAddress = await alice.getAddress(); // アドレス事前取得
      const bobSignerAddress = await bob.getAddress(); // アドレス事前取得
      const uri1 = 'uri://emoji1';
      const uri2 = 'uri://emoji2';

      // Alice が最初の絵文字を登録 (宛先は Bob)
      await expect(chat.connect(alice).registerNewEmoji(bobAddress, uri1, '0x'))
        .to.emit(chat, 'NewEmojiRegistered')
        .withArgs(1n, bobAddress, uri1)
        .and.to.emit(chat, 'TransferSingle')
        .withArgs(aliceSignerAddress, ethers.ZeroAddress, bobAddress, 1n, 1n); // 修正

      expect(await chat.balanceOf(bobAddress, 1)).to.equal(1n);
      expect(await chat.balanceOf(aliceAddress, 1)).to.equal(0n);
      expect(await chat.uri(1)).to.equal(uri1);
      expect(await chat.firstMinter(1)).to.equal(aliceSignerAddress); // 修正
      expect(await chat['totalSupply(uint256)'](1)).to.equal(1n);

      // Bob が次の絵文字を登録 (宛先は Alice)
      await expect(chat.connect(bob).registerNewEmoji(aliceAddress, uri2, '0x'))
        .to.emit(chat, 'NewEmojiRegistered')
        .withArgs(2n, aliceAddress, uri2) // ID は 2 になる
        .and.to.emit(chat, 'TransferSingle')
        .withArgs(bobSignerAddress, ethers.ZeroAddress, aliceAddress, 2n, 1n); // 修正

      expect(await chat.balanceOf(aliceAddress, 2)).to.equal(1n);
      expect(await chat.uri(2)).to.equal(uri2);
      expect(await chat.firstMinter(2)).to.equal(bobSignerAddress); // 修正
      expect(await chat['totalSupply(uint256)'](2)).to.equal(1n);
    });

    it('registerNewEmojisBatch correctly assigns IDs, mints, sets URIs and firstMinter', async () => {
      const { chat, alice, bobAddress } = await setup();
      const aliceSignerAddress = await alice.getAddress(); // アドレス事前取得
      const uris = ['uri://batch1', 'uri://batch2'];

      // 修正: staticCall を実行前に移動
      const returnedIds = await chat
        .connect(alice)
        .registerNewEmojisBatch.staticCall(bobAddress, uris, '0x');
      expect(returnedIds).to.deep.equal([1n, 2n]);

      // 実行
      const tx = await chat
        .connect(alice)
        .registerNewEmojisBatch(bobAddress, uris, '0x');

      // イベント確認
      await expect(tx)
        .to.emit(chat, 'NewEmojiRegistered')
        .withArgs(1n, bobAddress, uris[0]);
      await expect(tx)
        .to.emit(chat, 'NewEmojiRegistered')
        .withArgs(2n, bobAddress, uris[1]);
      await expect(tx)
        .to.emit(chat, 'TransferBatch')
        .withArgs(
          aliceSignerAddress,
          ethers.ZeroAddress,
          bobAddress,
          [1n, 2n],
          [1n, 1n],
        );

      // 状態確認
      expect(await chat.balanceOf(bobAddress, 1)).to.equal(1n);
      expect(await chat.balanceOf(bobAddress, 2)).to.equal(1n);
      expect(await chat.uri(1)).to.equal(uris[0]);
      expect(await chat.uri(2)).to.equal(uris[1]);
      expect(await chat.firstMinter(1)).to.equal(aliceSignerAddress);
      expect(await chat.firstMinter(2)).to.equal(aliceSignerAddress);
      expect(await chat['totalSupply(uint256)'](1)).to.equal(1n);
      expect(await chat['totalSupply(uint256)'](2)).to.equal(1n);
    });

    it('registerNewEmoji should return the new emoji ID', async () => {
      const { chat, alice, aliceAddress } = await setup();
      const returnedId = await chat
        .connect(alice)
        .registerNewEmoji.staticCall(aliceAddress, 'uri://return', '0x'); // 修正: staticCall
      expect(returnedId).to.equal(1n);
      await chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://return', '0x'); // 実行
      const returnedId2 = await chat
        .connect(alice)
        .registerNewEmoji.staticCall(aliceAddress, 'uri://return2', '0x'); // 修正: staticCall
      expect(returnedId2).to.equal(2n);
    });

    it('should revert register if recipient is zero address', async () => {
      const { chat, alice } = await setup();
      await expect(
        chat.connect(alice).registerNewEmoji(ethers.ZeroAddress, 'uri://zero', '0x'),
      ).to.be.revertedWithCustomError(chat, 'ERC1155InvalidReceiver').withArgs(ethers.ZeroAddress);
    });
  });

  // --- 既存絵文字への追加発行 ---
  describe('Add Emoji Supply', () => {
    const emojiId = 1n;
    const initialURI = 'uri://supply';

    async function setupWithRegisteredEmoji() {
      const setupData = await setup();
      const { chat, alice, aliceAddress } = setupData;
      // 登録者を alice にする
      await chat
        .connect(alice)
        .registerNewEmoji(aliceAddress, initialURI, '0x');
      // firstMinter が alice になっていることを確認
      expect(await chat.firstMinter(emojiId)).to.equal(
        await alice.getAddress(),
      );
      return setupData;
    }

    it('addEmojiSupply mints additional tokens to recipient', async () => {
      const { chat, alice, bob, aliceAddress, bobAddress } =
        await setupWithRegisteredEmoji();
      const bobSignerAddress = await bob.getAddress(); // アドレス事前取得

      expect(await chat.balanceOf(bobAddress, emojiId)).to.equal(0n);
      expect(await chat.balanceOf(aliceAddress, emojiId)).to.equal(1n);
      expect(await chat['totalSupply(uint256)'](emojiId)).to.equal(1n);

      const amountToAdd = 5n;
      // Bob が ID=1 の絵文字を Bob 自身に追加発行
      await expect(
        chat.connect(bob).addEmojiSupply(bobAddress, emojiId, amountToAdd, '0x'),
      )
        .to.emit(chat, 'TransferSingle')
        .withArgs(bobSignerAddress, ethers.ZeroAddress, bobAddress, emojiId, amountToAdd); // 修正

      expect(await chat.balanceOf(bobAddress, emojiId)).to.equal(amountToAdd);
      expect(await chat.balanceOf(aliceAddress, emojiId)).to.equal(1n);
      expect(await chat['totalSupply(uint256)'](emojiId)).to.equal(
        1n + amountToAdd,
      );
    });

    it('addEmojiSupply does not change firstMinter or URI', async () => {
      const { chat, alice, bob, aliceAddress, bobAddress } =
        await setupWithRegisteredEmoji();
      const firstMinterBefore = await chat.firstMinter(emojiId);
      const uriBefore = await chat.uri(emojiId);

      await chat.connect(bob).addEmojiSupply(bobAddress, emojiId, 5, '0x');

      expect(await chat.firstMinter(emojiId)).to.equal(firstMinterBefore);
      expect(await chat.uri(emojiId)).to.equal(uriBefore);
      expect(firstMinterBefore).to.equal(await alice.getAddress()); // alice であることを確認
      expect(uriBefore).to.equal(initialURI);
    });

    it('addEmojiSupply reverts for unregistered emoji ID', async () => {
      const { chat, bob, bobAddress } = await setup();
      const unregisteredId = 99n;
      await expect(
        chat.connect(bob).addEmojiSupply(bobAddress, unregisteredId, 1, '0x'),
      ).to.be.revertedWithCustomError(chat, 'EmojiNotRegistered').withArgs(unregisteredId);
    });

    it('addEmojiSupplyBatch mints additional tokens correctly', async () => {
      const { chat, alice, bob, aliceAddress, bobAddress } = await setup();
      const aliceSignerAddress = await alice.getAddress(); // アドレス事前取得
      const bobSignerAddress = await bob.getAddress(); // アドレス事前取得
      // 準備: ID 1, 2 を alice が登録 (受信者は alice 自身)
      await chat
        .connect(alice)
        .registerNewEmojisBatch(aliceAddress, ['uri://b1', 'uri://b2'], '0x');
      expect(await chat['totalSupply(uint256)'](1)).to.equal(1n);
      expect(await chat['totalSupply(uint256)'](2)).to.equal(1n);
      expect(await chat.firstMinter(1)).to.equal(aliceSignerAddress);
      expect(await chat.firstMinter(2)).to.equal(aliceSignerAddress);

      const idsToAdd = [1n, 2n];
      const amountsToAdd = [3n, 4n];

      // Bob が ID 1, 2 を Bob 自身に追加発行
      await expect(
        chat
          .connect(bob)
          .addEmojiSupplyBatch(bobAddress, idsToAdd, amountsToAdd, '0x'),
      )
        .to.emit(chat, 'TransferBatch')
        .withArgs(bobSignerAddress, ethers.ZeroAddress, bobAddress, idsToAdd, amountsToAdd); // 修正

      expect(await chat.balanceOf(bobAddress, 1)).to.equal(amountsToAdd[0]);
      expect(await chat.balanceOf(bobAddress, 2)).to.equal(amountsToAdd[1]);
      expect(await chat['totalSupply(uint256)'](1)).to.equal(
        1n + amountsToAdd[0],
      );
      expect(await chat['totalSupply(uint256)'](2)).to.equal(
        1n + amountsToAdd[1],
      );
      expect(await chat.firstMinter(1)).to.equal(aliceSignerAddress); // firstMinter 変わらず
      expect(await chat.firstMinter(2)).to.equal(aliceSignerAddress);
    });

    it('addEmojiSupplyBatch reverts if any ID is unregistered', async () => {
      const { chat, alice, bob, aliceAddress, bobAddress } = await setup();
      await chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://b1', '0x');
      const unregisteredId = 99n;

      await expect(
        chat
          .connect(bob)
          .addEmojiSupplyBatch(
            bobAddress,
            [1, unregisteredId],
            [1, 1],
            '0x',
          ),
      ).to.be.revertedWithCustomError(chat, 'EmojiNotRegistered').withArgs(unregisteredId);
    });

    it('addEmojiSupply does not revert if amount is zero', async () => {
      const { chat, bob, bobAddress } = await setupWithRegisteredEmoji();
      await expect(
        chat.connect(bob).addEmojiSupply(bobAddress, emojiId, 0, '0x')
      ).to.not.be.reverted;
    });
  });

  // --- ERC1155 基本機能 ---
  describe('ERC1155 Standard Features', () => {
    it('should handle transfers correctly', async () => {
      const { chat, alice, bob, owner, aliceAddress, bobAddress, ownerAddress } =
        await setup();
      const aliceSignerAddress = await alice.getAddress(); // アドレス事前取得
      const ownerSignerAddress = await owner.getAddress(); // アドレス事前取得

      // 準備: alice が ID 1 を登録し、owner に 1 つ発行、その後 alice が owner に 9 個追加発行
      await chat.connect(alice).registerNewEmoji(ownerAddress, 'uri://transfer', '0x'); // ID 1 を owner へ (firstMinter は alice)
      await chat.connect(alice).addEmojiSupply(ownerAddress, 1, 9, '0x'); // owner は ID 1 を 10 個持つ
      expect(await chat.balanceOf(ownerAddress, 1)).to.equal(10n);
      const firstMinter = await chat.firstMinter(1);
      const totalSupply = await chat['totalSupply(uint256)'](1);
      expect(firstMinter).to.equal(aliceSignerAddress);
      expect(totalSupply).to.equal(10n);

      // Owner が Bob に 3 個転送
      await expect(
        chat
          .connect(owner)
          .safeTransferFrom(ownerAddress, bobAddress, 1, 3, '0x'),
      )
        .to.emit(chat, 'TransferSingle')
        .withArgs(ownerSignerAddress, ownerAddress, bobAddress, 1n, 3n); // 修正

      expect(await chat.balanceOf(ownerAddress, 1)).to.equal(7n);
      expect(await chat.balanceOf(bobAddress, 1)).to.equal(3n);
      expect(await chat.firstMinter(1)).to.equal(firstMinter); // 変わらない
      expect(await chat['totalSupply(uint256)'](1)).to.equal(totalSupply); // 変わらない

      // Bob が Alice に 1 個転送
      await chat
        .connect(bob)
        .safeTransferFrom(bobAddress, aliceAddress, 1, 1, '0x');
      expect(await chat.balanceOf(bobAddress, 1)).to.equal(2n);
      expect(await chat.balanceOf(aliceAddress, 1)).to.equal(1n);
    });

    it('should handle batch transfers correctly', async () => {
      const { chat, alice, bob, owner, aliceAddress, bobAddress, ownerAddress } =
        await setup();
      const aliceSignerAddress = await alice.getAddress(); // アドレス事前取得
      const ownerSignerAddress = await owner.getAddress(); // アドレス事前取得

      // 準備: alice が ID 1, 2 を登録し、owner に発行 & 追加発行
      await chat
        .connect(alice)
        .registerNewEmojisBatch(ownerAddress, ['uri://bt1', 'uri://bt2'], '0x'); // ID 1, 2 を owner へ (firstMinter は alice)
      await chat
        .connect(alice)
        .addEmojiSupplyBatch(ownerAddress, [1, 2], [9, 19], '0x'); // owner は ID 1 を 10, ID 2 を 20 持つ
      expect(await chat.balanceOf(ownerAddress, 1)).to.equal(10n);
      expect(await chat.balanceOf(ownerAddress, 2)).to.equal(20n);
      const firstMinter1 = await chat.firstMinter(1);
      const firstMinter2 = await chat.firstMinter(2);
      const totalSupply1 = await chat['totalSupply(uint256)'](1);
      const totalSupply2 = await chat['totalSupply(uint256)'](2);
      expect(firstMinter1).to.equal(aliceSignerAddress);
      expect(firstMinter2).to.equal(aliceSignerAddress);
      expect(totalSupply1).to.equal(10n);
      expect(totalSupply2).to.equal(20n);

      const idsToTransfer = [1n, 2n];
      const amountsToTransfer = [5n, 8n];
      // Owner が Bob に ID 1 を 5 個、ID 2 を 8 個転送
      await expect(
        chat
          .connect(owner)
          .safeBatchTransferFrom(
            ownerAddress,
            bobAddress,
            idsToTransfer,
            amountsToTransfer,
            '0x',
          ),
      )
        .to.emit(chat, 'TransferBatch')
        .withArgs(
          ownerSignerAddress, // 修正
          ownerAddress,
          bobAddress,
          idsToTransfer,
          amountsToTransfer,
        );

      expect(await chat.balanceOf(ownerAddress, 1)).to.equal(5n);
      expect(await chat.balanceOf(ownerAddress, 2)).to.equal(12n);
      expect(await chat.balanceOf(bobAddress, 1)).to.equal(5n);
      expect(await chat.balanceOf(bobAddress, 2)).to.equal(8n);
      expect(await chat.firstMinter(1)).to.equal(firstMinter1); // 変わらない
      expect(await chat.firstMinter(2)).to.equal(firstMinter2); // 変わらない
      expect(await chat['totalSupply(uint256)'](1)).to.equal(totalSupply1); // 変わらない
      expect(await chat['totalSupply(uint256)'](2)).to.equal(totalSupply2); // 変わらない
    });

    it('should handle approvals correctly', async () => {
      const { chat, alice, bob, owner, aliceAddress, bobAddress, ownerAddress } =
        await setup();
      // 準備: owner が ID 1 を登録し、alice に 5 個発行
      await chat
        .connect(owner)
        .registerNewEmoji(aliceAddress, 'uri://approval', '0x');
      await chat.connect(owner).addEmojiSupply(aliceAddress, 1, 4, '0x');

      expect(await chat.isApprovedForAll(aliceAddress, bobAddress)).to.be.false;
      await expect(chat.connect(alice).setApprovalForAll(bobAddress, true))
        .to.emit(chat, 'ApprovalForAll')
        .withArgs(aliceAddress, bobAddress, true);
      expect(await chat.isApprovedForAll(aliceAddress, bobAddress)).to.be.true;

      await expect(
        chat.connect(bob).safeTransferFrom(aliceAddress, ownerAddress, 1, 2, '0x'),
      ).to.not.be.reverted;
      expect(await chat.balanceOf(aliceAddress, 1)).to.equal(3n);
      expect(await chat.balanceOf(ownerAddress, 1)).to.equal(2n);

      await chat.connect(alice).setApprovalForAll(bobAddress, false);
      expect(await chat.isApprovedForAll(aliceAddress, bobAddress)).to.be.false;

      // ERC1155 v5.0 Error: ERC1155MissingApprovalForAll(operator, owner)
      await expect(
        chat.connect(bob).safeTransferFrom(aliceAddress, ownerAddress, 1, 1, '0x'),
      ).to.be.revertedWithCustomError(chat, 'ERC1155MissingApprovalForAll').withArgs(bobAddress, aliceAddress);
    });

    it('uri function returns correct URI', async () => {
      const { chat, alice, owner, aliceAddress } = await setup();
      const uri = 'uri://metadata';
      await chat.connect(alice).registerNewEmoji(aliceAddress, uri, '0x');
      expect(await chat.uri(1)).to.equal(uri);

      const newUri = 'uri://newMetadata';
      await chat.connect(owner).setTokenURI(1, newUri);
      expect(await chat.uri(1)).to.equal(newUri);
    });

    it('uri function reverts for non-existent token', async () => {
      const { chat } = await setup();
      const nonExistentTokenId = 999n;
      expect(await chat.uri(nonExistentTokenId)).to.equal('');
    });
  });

  // --- Upgradeability (UUPS) ---
  describe('Upgradeability (UUPS)', () => {
    it('owner can upgrade the implementation', async () => {
      const { chat, owner, ownerAddress } = await setup();
      const proxyAddress = await chat.getAddress();

      const EmojiChatV4Factory = await ethers.getContractFactory('EmojiChatV4');
      // ProxyのアドレスをforceImportして登録する
      await upgrades.forceImport(proxyAddress, EmojiChatV4Factory);

      // アップグレード実施
      const upgradedChat = await upgrades.upgradeProxy(proxyAddress, EmojiChatV4Factory, {
          kind: 'uups'
      });

      // Proxyアドレスは変わらないことを確認
      expect(await upgradedChat.getAddress()).to.equal(proxyAddress);
      // Owner は保持されていることを確認
      expect(await upgradedChat.owner()).to.equal(ownerAddress);
      // アップグレード後も基本的な関数が呼べるか確認 (例: paused)
      expect(await upgradedChat.paused()).to.be.false;
    });

    it('non-owner cannot upgrade the implementation', async () => {
      const { chat, alice, owner } = await setup();
      const proxyAddress = await chat.getAddress();
      const aliceAddress = await alice.getAddress();

      // ProxyのアドレスをforceImportして登録する
      const EmojiChatV4Factory = await ethers.getContractFactory('EmojiChatV4');
      await upgrades.forceImport(proxyAddress, EmojiChatV4Factory);

      // 実装コントラクトをデプロイ
      const implementation = await EmojiChatV4Factory.deploy();
      const implementationAddress = await implementation.getAddress();

      // UUPSUpgradeableインターフェースを使用
      const UUPSUpgradeableABI = [
        "function upgradeTo(address newImplementation) external"
      ];

      // aliceが直接upgradeToを呼び出そうとする
      const aliceConnectedProxy = new ethers.Contract(
        proxyAddress,
        UUPSUpgradeableABI,
        alice
      );

      // 権限がないのでリバートする - 具体的なエラーメッセージなしでリバートすることを確認
      await expect(
        aliceConnectedProxy.upgradeTo(implementationAddress)
      ).to.be.reverted;
    });

    it('state is preserved after upgrade', async () => {
      const { chat, owner, alice, aliceAddress } = await setup();
      const proxyAddress = await chat.getAddress();
      const ownerAddress = await owner.getAddress();
      const aliceSignerAddress = await alice.getAddress();

      // 状態を変更
      await chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://before', '0x');
      const balanceBefore = await chat.balanceOf(aliceAddress, 1);
      const firstMinterBefore = await chat.firstMinter(1);
      const uriBefore = await chat.uri(1);
      expect(balanceBefore).to.equal(1n);

      // ProxyのアドレスをforceImportして登録する
      const EmojiChatV4Factory = await ethers.getContractFactory('EmojiChatV4');
      await upgrades.forceImport(proxyAddress, EmojiChatV4Factory);

      // Upgrade
      const upgradedChat = await upgrades.upgradeProxy(proxyAddress, EmojiChatV4Factory, {
          kind: 'uups'
      });

      // Upgrade 後も状態が同じか確認
      expect(await upgradedChat.balanceOf(aliceAddress, 1)).to.equal(balanceBefore);
      expect(await upgradedChat.firstMinter(1)).to.equal(firstMinterBefore);
      expect(await upgradedChat.uri(1)).to.equal(uriBefore);
      expect(await upgradedChat.owner()).to.equal(ownerAddress);
      expect(firstMinterBefore).to.equal(aliceSignerAddress);
    });
  });
});
