import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { DeployEmojiChatModule } from './DeployEmojiChat';

export const UpgradeEmojiChatModule = buildModule('UpgradeEmojiChat', (m) => {
  const { proxy } = m.useModule(DeployEmojiChatModule);

  const owner = m.getAccount(0);

  const newImplementation = m.contract('EmojiChatV2');

  const emojiChatProxy = m.contractAt('EmojiChat', proxy, {
    id: 'EmojiChatProxyForUpgrade',
  });

  m.call(emojiChatProxy, 'upgradeToAndCall', [newImplementation, '0x'], {
    from: owner,
  });

  const upgradedEmojiChat = m.contractAt('EmojiChatV2', proxy, {
    id: 'UpgradedEmojiChatProxy',
  });

  return {
    newImplementation,
    upgradedEmojiChat,
  };
});

export default UpgradeEmojiChatModule;
