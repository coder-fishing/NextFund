// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

    contract NextFundDonate {
        event DonationSent(
            address indexed donor,
            address indexed receiver,
            uint256 indexed campaignId,
            uint256 amount,
            uint256 timestamp
        );

        function donate(address receiver, uint256 campaignId) external payable {
            require(receiver != address(0), "Invalid receiver");
            require(msg.value > 0, "Amount must be > 0");

            (bool ok, ) = payable(receiver).call{value: msg.value}("");
            require(ok, "Transfer failed");

            emit DonationSent(msg.sender, receiver, campaignId, msg.value, block.timestamp);
        }
            
    }