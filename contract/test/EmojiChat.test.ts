import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import type { Signer } from 'ethers';
import { ethers, ignition, upgrades } from 'hardhat';
import { DeployEmojiChatModule } from '../ignition/modules/DeployEmojiChat';
import type { EmojiChatV5 } from '../typechain-types/contracts/EmojiChatV5';

const defaultMintPrice = ethers.parseEther('0.0005');

// Hardhatの推奨に従い、fixtureを使用
async function deployEmojiChatFixture(): Promise<{
  chat: EmojiChatV5;
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
  const chat = emojiChat as unknown as EmojiChatV5;

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

describe('EmojiChatV5 (proxy)', () => {
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
      const { chat, alice, aliceAddress, bob, bobAddress } = await setup();
      const aliceSignerAddress = await alice.getAddress();
      const tx = await chat
        .connect(alice)
        .registerNewEmoji(aliceAddress, 'uri://1', '0x', { value: defaultMintPrice });
      const receipt = await tx.wait();
      await expect(tx)
        .to.emit(chat, 'NewEmojiRegistered')
        .withArgs(1n, aliceAddress, 'uri://1');
      await expect(tx)
        .to.emit(chat, 'TransferSingle')
        .withArgs(
          aliceSignerAddress,
          ethers.ZeroAddress,
          aliceAddress,
          1n,
          1n,
        );

      await chat.connect(alice).registerNewEmoji(aliceAddress, "initial", "0x", {value: defaultMintPrice});
      await expect(chat.connect(bob).addEmojiSupply(bobAddress, 1, 5, '0x', { value: defaultMintPrice * 5n })).to
        .not.be.reverted;
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
      await expect(chat.connect(owner).setTokenURI(1, 'newURI')).to.not.be
        .reverted;
      await expect(chat.connect(owner).pause()).to.not.be.reverted;
      expect(await chat.paused()).to.be.true;
      await expect(chat.connect(owner).unpause()).to.not.be.reverted;
    });

    it('non-owner cannot call owner-only functions', async () => {
      const { chat, alice } = await setup();
      const aliceAddress = await alice.getAddress();
      const expectedRevertMsg = 'OwnableUnauthorizedAccount';

      await expect(chat.connect(alice).setTokenURI(1, 'x'))
        .to.be.revertedWithCustomError(chat, expectedRevertMsg)
        .withArgs(aliceAddress);
      await expect(chat.connect(alice).pause())
        .to.be.revertedWithCustomError(chat, expectedRevertMsg)
        .withArgs(aliceAddress);
      await expect(chat.connect(alice).unpause())
        .to.be.revertedWithCustomError(chat, expectedRevertMsg)
        .withArgs(aliceAddress);
    });

    it('anyone can call public minting functions', async () => {
      const { chat, alice, bob, aliceAddress, bobAddress } = await setup();
      await expect(
        chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://alice', '0x', { value: defaultMintPrice }),
      ).to.not.be.reverted;

      await expect(chat.connect(bob).addEmojiSupply(bobAddress, 1, 5, '0x', { value: defaultMintPrice * 5n })).to
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
        .registerNewEmoji(aliceAddress, 'uri://1', '0x', { value: defaultMintPrice });
      await chat
        .connect(alice)
        .safeTransferFrom(aliceAddress, bobAddress, 1, 1, '0x');

      await chat.connect(owner).pause();
      const expectedRevertMsg = 'EnforcedPause';

      await expect(
        chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://2', '0x', { value: defaultMintPrice }),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);
      await expect(
        chat.connect(bob).addEmojiSupply(bobAddress, 1, 1, '0x', { value: defaultMintPrice }),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);
      await expect(
        chat
          .connect(alice)
          .registerNewEmojisBatch(aliceAddress, ['uri://3'], '0x'),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);
      await expect(
        chat.connect(bob).addEmojiSupplyBatch(bobAddress, [1], [1], '0x'),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);

      await expect(
        chat.connect(bob).safeTransferFrom(bobAddress, aliceAddress, 1, 1, '0x'),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);
      await expect(
        chat
          .connect(bob)
          .safeBatchTransferFrom(bobAddress, aliceAddress, [1], [1], '0x'),
      ).to.be.revertedWithCustomError(chat, expectedRevertMsg);

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
      const aliceSignerAddress = await alice.getAddress();
      const bobSignerAddress = await bob.getAddress();
      const uri1 = 'uri://emoji1';
      const uri2 = 'uri://emoji2';

      await expect(chat.connect(alice).registerNewEmoji(bobAddress, uri1, '0x', { value: defaultMintPrice }))
        .to.emit(chat, 'NewEmojiRegistered')
        .withArgs(1n, bobAddress, uri1)
        .and.to.emit(chat, 'TransferSingle')
        .withArgs(aliceSignerAddress, ethers.ZeroAddress, bobAddress, 1n, 1n);

      expect(await chat.balanceOf(bobAddress, 1)).to.equal(1n);
      expect(await chat.balanceOf(aliceAddress, 1)).to.equal(0n);
      expect(await chat.uri(1)).to.equal(uri1);
      expect(await chat.firstMinter(1)).to.equal(aliceSignerAddress);
      expect(await chat['totalSupply(uint256)'](1)).to.equal(1n);

      await expect(chat.connect(bob).registerNewEmoji(aliceAddress, uri2, '0x', { value: defaultMintPrice }))
        .to.emit(chat, 'NewEmojiRegistered')
        .withArgs(2n, aliceAddress, uri2)
        .and.to.emit(chat, 'TransferSingle')
        .withArgs(bobSignerAddress, ethers.ZeroAddress, aliceAddress, 2n, 1n);

      expect(await chat.balanceOf(aliceAddress, 2)).to.equal(1n);
      expect(await chat.uri(2)).to.equal(uri2);
      expect(await chat.firstMinter(2)).to.equal(bobSignerAddress);
      expect(await chat['totalSupply(uint256)'](2)).to.equal(1n);
    });

    it('registerNewEmojisBatch correctly assigns IDs, mints, sets URIs and firstMinter', async () => {
      const { chat, alice, bobAddress } = await setup();
      const aliceSignerAddress = await alice.getAddress();
      const uris = ['uri://batch1', 'uri://batch2'];

      const returnedIds = await chat
        .connect(alice)
        .registerNewEmojisBatch.staticCall(bobAddress, uris, '0x');
      expect(returnedIds).to.deep.equal([1n, 2n]);

      const tx = await chat
        .connect(alice)
        .registerNewEmojisBatch(bobAddress, uris, '0x');

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
        .registerNewEmoji.staticCall(aliceAddress, 'uri://return', '0x', { value: defaultMintPrice });
      expect(returnedId).to.equal(1n);
      await chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://return', '0x', { value: defaultMintPrice });
      const returnedId2 = await chat
        .connect(alice)
        .registerNewEmoji.staticCall(aliceAddress, 'uri://return2', '0x', { value: defaultMintPrice });
      expect(returnedId2).to.equal(2n);
    });

    it('should revert register if recipient is zero address', async () => {
      const { chat, alice } = await setup();
      await expect(
        chat.connect(alice).registerNewEmoji(ethers.ZeroAddress, 'uri://zero', '0x', { value: defaultMintPrice }),
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
      await chat
        .connect(alice)
        .registerNewEmoji(aliceAddress, initialURI, '0x', { value: defaultMintPrice });
      expect(await chat.firstMinter(emojiId)).to.equal(
        await alice.getAddress(),
      );
      return setupData;
    }

    it('addEmojiSupply mints additional tokens to recipient', async () => {
      const { chat, alice, bob, aliceAddress, bobAddress } =
        await setupWithRegisteredEmoji();
      const bobSignerAddress = await bob.getAddress();

      expect(await chat.balanceOf(bobAddress, emojiId)).to.equal(0n);
      expect(await chat.balanceOf(aliceAddress, emojiId)).to.equal(1n);
      expect(await chat['totalSupply(uint256)'](emojiId)).to.equal(1n);

      const amountToAdd = 5n;
      const requiredValue = defaultMintPrice * amountToAdd;
      await expect(
        chat.connect(bob).addEmojiSupply(bobAddress, emojiId, amountToAdd, '0x', { value: requiredValue }),
      )
        .to.emit(chat, 'TransferSingle')
        .withArgs(bobSignerAddress, ethers.ZeroAddress, bobAddress, emojiId, amountToAdd);

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

      const amountToAdd = 5n;
      const requiredValue = defaultMintPrice * amountToAdd;
      await chat.connect(bob).addEmojiSupply(bobAddress, emojiId, amountToAdd, '0x', { value: requiredValue });

      expect(await chat.firstMinter(emojiId)).to.equal(firstMinterBefore);
      expect(await chat.uri(emojiId)).to.equal(uriBefore);
      expect(firstMinterBefore).to.equal(await alice.getAddress());
      expect(uriBefore).to.equal(initialURI);
    });

    it('addEmojiSupply reverts for unregistered emoji ID', async () => {
      const { chat, bob, bobAddress } = await setup();
      const unregisteredId = 99n;
      await expect(
        chat.connect(bob).addEmojiSupply(bobAddress, unregisteredId, 1, '0x', { value: defaultMintPrice }),
      ).to.be.revertedWithCustomError(chat, 'EmojiNotRegistered').withArgs(unregisteredId);
    });

    it('addEmojiSupplyBatch mints additional tokens correctly', async () => {
      const { chat, alice, bob, aliceAddress, bobAddress } = await setup();
      const aliceSignerAddress = await alice.getAddress();
      const bobSignerAddress = await bob.getAddress();
      await chat
        .connect(alice)
        .registerNewEmojisBatch(aliceAddress, ['uri://b1', 'uri://b2'], '0x');
      expect(await chat['totalSupply(uint256)'](1)).to.equal(1n);
      expect(await chat['totalSupply(uint256)'](2)).to.equal(1n);
      expect(await chat.firstMinter(1)).to.equal(aliceSignerAddress);
      expect(await chat.firstMinter(2)).to.equal(aliceSignerAddress);

      const idsToAdd = [1n, 2n];
      const amountsToAdd = [3n, 4n];

      await expect(
        chat
          .connect(bob)
          .addEmojiSupplyBatch(bobAddress, idsToAdd, amountsToAdd, '0x'),
      )
        .to.emit(chat, 'TransferBatch')
        .withArgs(bobSignerAddress, ethers.ZeroAddress, bobAddress, idsToAdd, amountsToAdd);

      expect(await chat.balanceOf(bobAddress, 1)).to.equal(amountsToAdd[0]);
      expect(await chat.balanceOf(bobAddress, 2)).to.equal(amountsToAdd[1]);
      expect(await chat['totalSupply(uint256)'](1)).to.equal(
        1n + amountsToAdd[0],
      );
      expect(await chat['totalSupply(uint256)'](2)).to.equal(
        1n + amountsToAdd[1],
      );
      expect(await chat.firstMinter(1)).to.equal(aliceSignerAddress);
      expect(await chat.firstMinter(2)).to.equal(aliceSignerAddress);
    });

    it('addEmojiSupplyBatch reverts if any ID is unregistered', async () => {
      const { chat, alice, bob, aliceAddress, bobAddress } = await setup();
      await chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://b1', '0x', { value: defaultMintPrice });
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
        chat.connect(bob).addEmojiSupply(bobAddress, emojiId, 0, '0x', { value: 0 })
      ).to.not.be.reverted;
    });
  });

  // --- ERC1155 基本機能 ---
  describe('ERC1155 Standard Features', () => {
    it('should handle transfers correctly', async () => {
      const { chat, alice, bob, owner, aliceAddress, bobAddress, ownerAddress } =
        await setup();
      const aliceSignerAddress = await alice.getAddress();
      const ownerSignerAddress = await owner.getAddress();

      await chat.connect(alice).registerNewEmoji(ownerAddress, 'uri://transfer', '0x', { value: defaultMintPrice });
      await chat.connect(alice).addEmojiSupply(ownerAddress, 1, 9, '0x', { value: defaultMintPrice * 9n });
      expect(await chat.balanceOf(ownerAddress, 1)).to.equal(10n);
      const firstMinter = await chat.firstMinter(1);
      const totalSupply = await chat['totalSupply(uint256)'](1);
      expect(firstMinter).to.equal(aliceSignerAddress);
      expect(totalSupply).to.equal(10n);

      await expect(
        chat
          .connect(owner)
          .safeTransferFrom(ownerAddress, bobAddress, 1, 3, '0x'),
      )
        .to.emit(chat, 'TransferSingle')
        .withArgs(ownerSignerAddress, ownerAddress, bobAddress, 1n, 3n);

      expect(await chat.balanceOf(ownerAddress, 1)).to.equal(7n);
      expect(await chat.balanceOf(bobAddress, 1)).to.equal(3n);
      expect(await chat.firstMinter(1)).to.equal(firstMinter);
      expect(await chat['totalSupply(uint256)'](1)).to.equal(totalSupply);

      await chat
        .connect(bob)
        .safeTransferFrom(bobAddress, aliceAddress, 1, 1, '0x');
      expect(await chat.balanceOf(bobAddress, 1)).to.equal(2n);
      expect(await chat.balanceOf(aliceAddress, 1)).to.equal(1n);
    });

    it('should handle batch transfers correctly', async () => {
      const { chat, alice, bob, owner, aliceAddress, bobAddress, ownerAddress } =
        await setup();
      const aliceSignerAddress = await alice.getAddress();
      const ownerSignerAddress = await owner.getAddress();

      await chat
        .connect(alice)
        .registerNewEmojisBatch(ownerAddress, ['uri://bt1', 'uri://bt2'], '0x');
      await chat
        .connect(alice)
        .addEmojiSupplyBatch(ownerAddress, [1, 2], [9, 19], '0x');
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
          ownerSignerAddress,
          ownerAddress,
          bobAddress,
          idsToTransfer,
          amountsToTransfer,
        );

      expect(await chat.balanceOf(ownerAddress, 1)).to.equal(5n);
      expect(await chat.balanceOf(ownerAddress, 2)).to.equal(12n);
      expect(await chat.balanceOf(bobAddress, 1)).to.equal(5n);
      expect(await chat.balanceOf(bobAddress, 2)).to.equal(8n);
      expect(await chat.firstMinter(1)).to.equal(firstMinter1);
      expect(await chat.firstMinter(2)).to.equal(firstMinter2);
      expect(await chat['totalSupply(uint256)'](1)).to.equal(totalSupply1);
      expect(await chat['totalSupply(uint256)'](2)).to.equal(totalSupply2);
    });

    it('should handle approvals correctly', async () => {
      const { chat, alice, bob, owner, aliceAddress, bobAddress, ownerAddress } =
        await setup();
      await chat
        .connect(owner)
        .registerNewEmoji(aliceAddress, 'uri://approval', '0x', { value: defaultMintPrice });
      await chat.connect(owner).addEmojiSupply(aliceAddress, 1, 4, '0x', { value: defaultMintPrice * 4n });

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

      await expect(
        chat.connect(bob).safeTransferFrom(aliceAddress, ownerAddress, 1, 1, '0x'),
      ).to.be.revertedWithCustomError(chat, 'ERC1155MissingApprovalForAll').withArgs(bobAddress, aliceAddress);
    });

    it('uri function returns correct URI', async () => {
      const { chat, alice, owner, aliceAddress } = await setup();
      const uri = 'uri://metadata';
      await chat.connect(alice).registerNewEmoji(aliceAddress, uri, '0x', { value: defaultMintPrice });
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

      const EmojiChatV5Factory = await ethers.getContractFactory('EmojiChatV5');
      await upgrades.forceImport(proxyAddress, EmojiChatV5Factory);

      const upgradedChat = await upgrades.upgradeProxy(proxyAddress, EmojiChatV5Factory, {
          kind: 'uups'
      });

      expect(await upgradedChat.getAddress()).to.equal(proxyAddress);
      expect(await upgradedChat.owner()).to.equal(ownerAddress);
      expect(await upgradedChat.paused()).to.be.false;
    });

    it('non-owner cannot upgrade the implementation', async () => {
      const { chat, alice, owner } = await setup();
      const proxyAddress = await chat.getAddress();
      const aliceAddress = await alice.getAddress();

      const EmojiChatV5Factory = await ethers.getContractFactory('EmojiChatV5');
      await upgrades.forceImport(proxyAddress, EmojiChatV5Factory);

      const implementation = await EmojiChatV5Factory.deploy();
      const implementationAddress = await implementation.getAddress();

      const UUPSUpgradeableABI = [
        "function upgradeTo(address newImplementation) external"
      ];

      const aliceConnectedProxy = new ethers.Contract(
        proxyAddress,
        UUPSUpgradeableABI,
        alice
      );

      await expect(
        aliceConnectedProxy.upgradeTo(implementationAddress)
      ).to.be.reverted;
    });

    it('state is preserved after upgrade', async () => {
      const { chat, owner, alice, aliceAddress } = await setup();
      const proxyAddress = await chat.getAddress();
      const ownerAddress = await owner.getAddress();
      const aliceSignerAddress = await alice.getAddress();

      await chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://before', '0x', { value: defaultMintPrice });
      const balanceBefore = await chat.balanceOf(aliceAddress, 1);
      const firstMinterBefore = await chat.firstMinter(1);
      const uriBefore = await chat.uri(1);
      expect(balanceBefore).to.equal(1n);

      const EmojiChatV5Factory = await ethers.getContractFactory('EmojiChatV5');
      await upgrades.forceImport(proxyAddress, EmojiChatV5Factory);

      const upgradedChat = await upgrades.upgradeProxy(proxyAddress, EmojiChatV5Factory, {
          kind: 'uups'
      });

      expect(await upgradedChat.balanceOf(aliceAddress, 1)).to.equal(balanceBefore);
      expect(await upgradedChat.firstMinter(1)).to.equal(firstMinterBefore);
      expect(await upgradedChat.uri(1)).to.equal(uriBefore);
      expect(await upgradedChat.owner()).to.equal(ownerAddress);
      expect(firstMinterBefore).to.equal(aliceSignerAddress);
    });
  });

  // --- Revenue Sharing ---
  describe('Revenue Sharing', () => {
    const defaultMintPrice = ethers.parseEther('0.0005');
    const defaultProtocolFeePercent = 40n;
    const defaultCreatorFeePercent = 100n - defaultProtocolFeePercent;

    it('should initialize with default price and fee', async () => {
      const { chat } = await setup();
      expect(await chat.mintPrice()).to.equal(defaultMintPrice);
      expect(await chat.protocolFeePercent()).to.equal(
        defaultProtocolFeePercent,
      );
    });

    describe('Setters', () => {
      it('owner can set mint price', async () => {
        const { chat, owner } = await setup();
        const newPrice = ethers.parseEther('0.01');
        await expect(chat.connect(owner).setMintPrice(newPrice))
          .to.emit(chat, 'MintPriceSet')
          .withArgs(newPrice);
        expect(await chat.mintPrice()).to.equal(newPrice);
      });

      it('non-owner cannot set mint price', async () => {
        const { chat, alice } = await setup();
        const newPrice = ethers.parseEther('0.01');
        await expect(
          chat.connect(alice).setMintPrice(newPrice),
        ).to.be.revertedWithCustomError(
          chat,
          'OwnableUnauthorizedAccount',
        );
      });

      it('owner can set protocol fee percent', async () => {
        const { chat, owner } = await setup();
        const newFee = 50n;
        await expect(chat.connect(owner).setProtocolFeePercent(newFee))
          .to.emit(chat, 'ProtocolFeePercentSet')
          .withArgs(newFee);
        expect(await chat.protocolFeePercent()).to.equal(newFee);
      });

      it('non-owner cannot set protocol fee percent', async () => {
        const { chat, alice } = await setup();
        await expect(
          chat.connect(alice).setProtocolFeePercent(50),
        ).to.be.revertedWithCustomError(
          chat,
          'OwnableUnauthorizedAccount',
        );
      });

      it('cannot set protocol fee percent over 100', async () => {
        const { chat, owner } = await setup();
        await expect(
          chat.connect(owner).setProtocolFeePercent(101),
        ).to.be.revertedWithCustomError(
            chat,
            'InvalidFeePercentage'
        ).withArgs(101);
      });
    });

    describe('registerNewEmoji with Revenue Sharing', () => {
        it('reverts if incorrect ETH amount is sent', async () => {
            const { chat, alice, aliceAddress } = await setup();
            const wrongPrice = defaultMintPrice / 2n;
            await expect(
                chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://fail', '0x', { value: wrongPrice }),
            ).to.be.revertedWithCustomError(
                chat,
                'IncorrectPaymentValue'
            ).withArgs(defaultMintPrice, wrongPrice);
        });

        it('distributes fees correctly between creator (caller) and protocol (owner)', async () => {
            const { chat, owner, alice, ownerAddress, aliceAddress } = await setup();
            const protocolFee = (defaultMintPrice * defaultProtocolFeePercent) / 100n;
            const creatorFee = defaultMintPrice - protocolFee;

            await expect(
                chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://distribute', '0x', { value: defaultMintPrice }),
            ).to.changeEtherBalances(
                [alice, owner],
                [-defaultMintPrice + creatorFee, protocolFee],
            );

            const newId = 1n;
            expect(await chat.firstMinter(newId)).to.equal(aliceAddress);
            expect(await chat.balanceOf(aliceAddress, newId)).to.equal(1n);
            expect(await chat.uri(newId)).to.equal('uri://distribute');
        });

        it('works correctly when mintPrice is zero', async () => {
            const { chat, owner, alice, aliceAddress } = await setup();
            await chat.connect(owner).setMintPrice(0);

            await expect(
                chat.connect(alice).registerNewEmoji(aliceAddress, 'uri://free', '0x', { value: 0 }),
            ).to.changeEtherBalances([alice, owner], [0, 0]);

            expect(await chat.balanceOf(aliceAddress, 1)).to.equal(1n);
            expect(await chat.firstMinter(1)).to.equal(aliceAddress);
        });
    });

     describe('addEmojiSupply with Revenue Sharing', () => {
        const emojiId = 1n;
        const initialURI = 'uri://supply-revenue';
        const quantityToAdd = 3n;
        const requiredPayment = defaultMintPrice * quantityToAdd;

        async function setupWithRegisteredEmojiAndPrice() {
            const setupData = await setup();
            const { chat, alice, aliceAddress, owner, ownerAddress } = setupData;
            await chat.connect(alice).registerNewEmoji(aliceAddress, initialURI, '0x', { value: defaultMintPrice });
            expect(await chat.firstMinter(emojiId)).to.equal(aliceAddress);
            expect(await chat.mintPrice()).to.equal(defaultMintPrice);
            return setupData;
        }

        it('reverts if incorrect ETH amount is sent', async () => {
            const { chat, bob, bobAddress } = await setupWithRegisteredEmojiAndPrice();
            const wrongPrice = requiredPayment / 2n;
            await expect(
                chat.connect(bob).addEmojiSupply(bobAddress, emojiId, quantityToAdd, '0x', { value: wrongPrice }),
            ).to.be.revertedWithCustomError(
                chat,
                'IncorrectPaymentValue'
            ).withArgs(requiredPayment, wrongPrice);
        });

        it('distributes fees correctly between first minter (creator) and protocol (owner)', async () => {
            const { chat, owner, alice, bob, ownerAddress, aliceAddress, bobAddress } = await setupWithRegisteredEmojiAndPrice();
            const protocolFee = (requiredPayment * defaultProtocolFeePercent) / 100n;
            const creatorFee = requiredPayment - protocolFee;

            await expect(
                chat.connect(bob).addEmojiSupply(bobAddress, emojiId, quantityToAdd, '0x', { value: requiredPayment }),
            ).to.changeEtherBalances(
                [alice, owner, bob],
                [creatorFee, protocolFee, -requiredPayment],
            );

            expect(await chat.balanceOf(bobAddress, emojiId)).to.equal(quantityToAdd);
            expect(await chat['totalSupply(uint256)'](emojiId)).to.equal(1n + quantityToAdd);
        });

         it('works correctly when mintPrice is zero', async () => {
             const { chat, owner, alice, bob, aliceAddress, bobAddress } = await setupWithRegisteredEmojiAndPrice();
             await chat.connect(owner).setMintPrice(0);

             await expect(
                 chat.connect(bob).addEmojiSupply(bobAddress, emojiId, quantityToAdd, '0x', { value: 0 }),
             ).to.changeEtherBalances([alice, owner, bob], [0, 0, 0]);

             expect(await chat.balanceOf(bobAddress, emojiId)).to.equal(quantityToAdd);
         });
    });
  });
});
