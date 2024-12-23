// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentReceiver {
    event PaymentReceived(address indexed from, uint256 amount);
    event PaymentDetailsRecorded(address indexed sender, address indexed receiver, uint256 amount);

    struct Payment {
        address sender;
        address receiver;
        uint256 amount;
    }

    mapping(uint256 => Payment) public payments;
    uint256 public paymentCount;

    // Function to record payment details
    function recordPayment(address receiver) external payable {
        require(msg.value > 0, "Payment amount must be greater than zero");
        require(receiver != address(0), "Invalid receiver address");

        // Increment the payment count
        paymentCount += 1;

        // Store the payment details
        payments[paymentCount] = Payment({
            sender: msg.sender,
            receiver: receiver,
            amount: msg.value
        });

        // Emit the payment details event
        emit PaymentDetailsRecorded(msg.sender, receiver, msg.value);

        // Emit the payment received event
        emit PaymentReceived(msg.sender, msg.value);

        // Transfer the amount to the receiver
        payable(receiver).transfer(msg.value);
    }

    // Fallback function to receive ETH
    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }
    

    // Function to fund the contract with Ether (can be called by anyone)
    function fundContract() public payable {}
}
