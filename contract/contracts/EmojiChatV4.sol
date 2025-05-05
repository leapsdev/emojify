// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import {ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC1155URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

error EmojiNotRegistered(uint256 emojiId);

contract EmojiChatV4 is
    Initializable,
    ContextUpgradeable,
    ERC1155URIStorageUpgradeable,
    ERC1155PausableUpgradeable,
    ERC1155SupplyUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    mapping(uint256 => address) public firstMinter;
    uint256 private _nextTokenId;

    event NewEmojiRegistered(
        uint256 indexed emojiId,
        address indexed recipient,
        string tokenURI
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Context_init();
        __ERC1155_init("");
        __ERC1155URIStorage_init();
        __Ownable_init(initialOwner);
        __ERC1155Pausable_init();
        __ERC1155Supply_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        _nextTokenId = 1;
    }

    function setTokenURI(
        uint256 tokenId,
        string memory tokenURI
    ) external onlyOwner nonReentrant {
        _setURI(tokenId, tokenURI);
    }

    function pause() public onlyOwner nonReentrant {
        _pause();
    }

    function unpause() public onlyOwner nonReentrant {
        _unpause();
    }

    function registerNewEmoji(
        address recipient,
        string memory tokenURI,
        bytes memory data
    ) public nonReentrant returns (uint256) {
        uint256 newEmojiId = _nextTokenId++;
        require(newEmojiId > 0, "Token ID overflow");

        firstMinter[newEmojiId] = _msgSender();
        _setURI(newEmojiId, tokenURI);
        _mint(recipient, newEmojiId, 1, data);

        emit NewEmojiRegistered(newEmojiId, recipient, tokenURI);
        return newEmojiId;
    }

    function addEmojiSupply(
        address recipient,
        uint256 emojiId,
        uint256 quantity,
        bytes memory data
    ) public nonReentrant {
        if (firstMinter[emojiId] == address(0)) {
            revert EmojiNotRegistered(emojiId);
        }
        _mint(recipient, emojiId, quantity, data);
    }

    function registerNewEmojisBatch(
        address recipient,
        string[] memory tokenURIs,
        bytes memory data
    ) public nonReentrant returns (uint256[] memory) {
        uint256 batchSize = tokenURIs.length;
        require(batchSize > 0, "URIs cannot be empty");

        uint256[] memory newEmojiIds = new uint256[](batchSize);
        uint256[] memory amounts = new uint256[](batchSize);
        uint256 currentNextId = _nextTokenId;
        address sender = _msgSender();

        for (uint256 i = 0; i < batchSize; i++) {
            uint256 newId = currentNextId + i;
            require(newId > 0, "Token ID overflow");
            newEmojiIds[i] = newId;
            amounts[i] = 1;

            firstMinter[newId] = sender;
            _setURI(newId, tokenURIs[i]);
            emit NewEmojiRegistered(newId, recipient, tokenURIs[i]);
        }

        _nextTokenId = currentNextId + batchSize;
        _mintBatch(recipient, newEmojiIds, amounts, data);

        return newEmojiIds;
    }

    function addEmojiSupplyBatch(
        address recipient,
        uint256[] memory emojiIds,
        uint256[] memory quantities,
        bytes memory data
    ) public nonReentrant {
        require(
            emojiIds.length == quantities.length,
            "IDs and quantities length mismatch"
        );
        for (uint256 i = 0; i < emojiIds.length; i++) {
            if (firstMinter[emojiIds[i]] == address(0)) {
                revert EmojiNotRegistered(emojiIds[i]);
            }
        }
        _mintBatch(recipient, emojiIds, quantities, data);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    )
        internal
        override(
            ERC1155Upgradeable,
            ERC1155PausableUpgradeable,
            ERC1155SupplyUpgradeable
        )
    {
        super._update(from, to, ids, values);
    }

    function uri(
        uint256 tokenId
    )
        public
        view
        virtual
        override(ERC1155Upgradeable, ERC1155URIStorageUpgradeable)
        returns (string memory)
    {
        return ERC1155URIStorageUpgradeable.uri(tokenId);
    }
}
