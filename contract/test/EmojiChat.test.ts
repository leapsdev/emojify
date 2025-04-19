import { expect } from 'chai';
import type { Signer } from 'ethers';
import { ethers, ignition } from 'hardhat';
import { DeployEmojiChatModule } from '../ignition/modules/DeployEmojiChat';
import type { EmojiChat } from '../typechain-types/contracts/EmojiChat';

describe('EmojiChat (proxy)', () => {
  let chat: EmojiChat;
  let owner: Signer;
  let alice: Signer;
  let ownerAddress: string;
  let aliceAddress: string;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    alice = signers[1];
    ownerAddress = await owner.getAddress();
    aliceAddress = await alice.getAddress();

    // DeployEmojiChatModule からデプロイ
    const { emojiChat } = await ignition.deploy(DeployEmojiChatModule);
    chat = emojiChat as unknown as EmojiChat;

    // 各テスト前に確実にunpause状態にする
    if (await chat.paused()) {
      await chat.connect(owner).unpause();
    }
  });

  it('Initialize sets owner correctly', async () => {
    expect(await chat.owner()).to.eq(ownerAddress);
  });

  it('Re-initialize should revert', async () => {
    await expect(chat.initialize(ownerAddress)).to.be.reverted;
  });

  it('Owner can set URI', async () => {
    await chat.connect(owner).setURI('https://example.com/{id}.json');
    expect(await chat.uri(0)).to.eq('https://example.com/{id}.json');
  });

  it('Non-owner cannot set URI', async () => {
    await expect(chat.connect(alice).setURI('x')).to.be.reverted;
  });

  it('Pause / Unpause', async () => {
    await chat.connect(owner).pause();
    expect(await chat.paused()).to.be.true;
    await expect(chat.mint(aliceAddress, 1, 10, '0x')).to.be.reverted;
    await chat.connect(owner).unpause();
    expect(await chat.paused()).to.be.false;
  });

  it('Non-owner cannot pause/unpause', async () => {
    await expect(chat.connect(alice).pause()).to.be.reverted;
    await expect(chat.connect(alice).unpause()).to.be.reverted;
  });

  it('Single mint sets firstMinter & balances', async () => {
    await chat.connect(owner).mint(aliceAddress, 42, 5, '0x');
    expect(await chat.firstMinter(42)).to.eq(aliceAddress);
    expect(await chat.balanceOf(aliceAddress, 42)).to.eq(5n);
    expect(await chat['totalSupply(uint256)'](42)).to.eq(5n);

    // 追加発行
    await chat.connect(owner).mint(aliceAddress, 42, 3, '0x');
    expect(await chat.firstMinter(42)).to.eq(aliceAddress);
    expect(await chat.balanceOf(aliceAddress, 42)).to.eq(8n);
    expect(await chat['totalSupply(uint256)'](42)).to.eq(8n);
  });

  it('Batch mint works and firstMinter is immutable', async () => {
    await chat.connect(owner).mintBatch(ownerAddress, [1, 2], [2, 3], '0x');
    expect(await chat.firstMinter(1)).to.eq(ownerAddress);
    expect(await chat.firstMinter(2)).to.eq(ownerAddress);
    expect(await chat.balanceOf(ownerAddress, 1)).to.eq(2n);
    expect(await chat.balanceOf(ownerAddress, 2)).to.eq(3n);

    // 再度バッチ
    await chat.connect(owner).mintBatch(aliceAddress, [1, 2], [1, 1], '0x');
    expect(await chat.firstMinter(1)).to.eq(ownerAddress);
    expect(await chat.firstMinter(2)).to.eq(ownerAddress);
  });

  it('Transfer updates balances but not totalSupply', async () => {
    // 先にミントしておく
    await chat.connect(owner).mintBatch(ownerAddress, [1], [2], '0x');
    // owner がトークン id=1 を alice へ
    await chat
      .connect(owner)
      .safeTransferFrom(ownerAddress, aliceAddress, 1, 1, '0x');
    expect(await chat.balanceOf(ownerAddress, 1)).to.eq(1n);
    expect(await chat.balanceOf(aliceAddress, 1)).to.eq(1n);
    expect(await chat['totalSupply(uint256)'](1)).to.eq(2n); // 転送では変化しない
  });

  it('Only owner can upgrade implementation (UUPS)', async () => {
    // 新しい実装をデプロイ
    const NewImpl = await ethers.getContractFactory('EmojiChat');
    const newImpl = await NewImpl.deploy();

    // オーナーは upgradeToAndCall を使って実装を更新できる
    await chat
      .connect(owner)
      .upgradeToAndCall(await newImpl.getAddress(), '0x');

    // 非オーナーからは実装アップグレード不可
    const NewImplAgain = await ethers.getContractFactory('EmojiChat');
    const newImplAgain = await NewImplAgain.deploy();
    await expect(
      chat
        .connect(alice)
        .upgradeToAndCall(await newImplAgain.getAddress(), '0x'),
    ).to.be.reverted;
  });
});
