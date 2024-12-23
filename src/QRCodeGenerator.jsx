import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ethers } from "ethers";

const QRCodeGenerator = ({ contractAddress }) => {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [showDefaultQR, setShowDefaultQR] = useState(false);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);  // Updated provider
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setReceiverAddress(address);
          setWalletConnected(true);
        } catch (err) {
          console.error("Wallet connection error:", err);
        }
      }
    };

    const stopCamera = () => {
      // Stop any active video streams
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((err) => {
          // Ignore errors if no camera is active
          console.log("No active camera to stop:", err.message);
        });
    };

    // Stop the camera when this component mounts
    stopCamera();
    fetchWalletAddress();

    return () => {
      // Ensure camera is stopped when component unmounts
      stopCamera();
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setReceiverAddress(accounts[0]);
      setWalletConnected(true);
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Generate QR Code</h2>

      {!walletConnected ? (
        <button
          onClick={connectWallet}
          className="p-2 mb-4 bg-blue-600 text-white rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <p className="text-green-500 mb-4">Wallet Connected</p>
      )}

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setShowDefaultQR(false)}
          className={`p-2 rounded ${!showDefaultQR ? "bg-blue-600 text-white" : "bg-gray-300"}`}
        >
          QR with Amount
        </button>
        <button
          onClick={() => setShowDefaultQR(true)}
          className={`p-2 rounded ${showDefaultQR ? "bg-blue-600 text-white" : "bg-gray-300"}`}
        >
          Default QR
        </button>
      </div>

      {!showDefaultQR ? (
        <>
          <input
            type="text"
            placeholder="Receiver Address"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            className="w-full max-w-md p-2 mb-3 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Amount (ETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full max-w-md p-2 mb-3 border border-gray-300 rounded"
          />
          {receiverAddress && amount ? (
            <div className="flex justify-center items-center mt-4 bg-white p-4 rounded-lg shadow-lg">
              <QRCodeCanvas
                value={JSON.stringify({
                  contract: contractAddress,
                  receiver: receiverAddress,
                  amount,
                })}
                size={200}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Fill in the details to generate a QR code</p>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center mt-4 bg-white p-4 rounded-lg shadow-lg">
          {receiverAddress ? (
            <QRCodeCanvas
              value={JSON.stringify({
                contract: contractAddress,
                receiver: receiverAddress,
              })}
              size={200}
            />
          ) : (
            <p className="text-sm text-gray-500">Connect your wallet to generate the default QR code</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
