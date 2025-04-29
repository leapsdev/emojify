import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export const DeployEmojiChatModule = buildModule('DeployEmojiChat', (m) => {
  const deployer = m.getAccount(0);

  const implementation = m.contract('EmojiChatV3');

  const initializeCalldata = m.encodeFunctionCall(
    implementation,
    'initialize',
    [deployer],
  );

  const proxy = m.contract('ERC1967Proxy', [
    implementation,
    initializeCalldata,
  ]);

  const emojiChat = m.contractAt('EmojiChatV3', proxy, {
    id: 'EmojiChatProxy',
  });

  return {
    implementation,
    proxy,
    emojiChat,
  };
});

export default DeployEmojiChatModule;
