import React from "react";
import { ethers } from "ethers";
import abi from "./abi.json";

const PaymentHandler = ({ paymentDetails }) => {
  const { contract, receiver, amount } = paymentDetails;

  const handlePayment = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum); // Updated from Web3Provider
      const signer = await provider.getSigner();

      try {
        const contractInstance = new ethers.Contract(contract, abi, signer);
        const tx = await contractInstance.pay(receiver, {
          value: ethers.parseEther(amount), // Updated parseEther syntax
        });
        await tx.wait();
        alert("Payment Successful!");
      } catch (err) {
        console.error("Payment Failed:", err);
        alert("Payment failed!");
      }
    } else {
      alert("MetaMask is not installed.");
    }
  };

  return (
    <div>
      <h2>Payment Details</h2>
      <p>Receiver: {receiver}</p>
      <p>Amount: {amount} ETH</p>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default PaymentHandler;
