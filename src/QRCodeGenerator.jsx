import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ethers } from "ethers";

const QRCodeGenerator = ({ contractAddress }) => {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [showDefaultQR, setShowDefaultQR] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [selectedButton, setSelectedButton] = useState(null); // Track selected button

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
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
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((err) => {
          console.log("No active camera to stop:", err.message);
        });
    };

    stopCamera();
    fetchWalletAddress();

    return () => {
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

  const handleAmountChange = (e) => {
    // Allow only numbers and a single decimal point
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleReceiverAddressChange = (e) => {
    const value = e.target.value;
    setReceiverAddress(value);
    // Validate the address
    setIsValidAddress(ethers.utils.isAddress(value));
  };
  const buttonStyle = {
    background: "linear-gradient(to bottom, #00BFFF, #1E90FF)", // Brighter blue gradient from top to bottom
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    margin: "5px",
    transition: "all 0.3s ease-in-out", // Smooth transition for hover
  };
  
  const buttonHoverStyle = {
    background: "linear-gradient(to bottom, #1E90FF, #00BFFF)", // Reversed gradient on hover for effect
    backgroundPosition: "bottom center",
  };
  
  const selectedButtonStyle = {
    ...buttonStyle,
    border: "2px solid #FFD700", // Gold border for the selected button
    boxShadow: "0px 0px 10px rgba(255, 215, 0, 0.5)", // Gold glow effect to highlight the selected button
  };
  
  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  };
  

  const containerStyle = {
    backgroundImage: 'url("/background.png")',
    backgroundColor: "#0B062B",
    backgroundSize: "cover",
    color: "white",
    padding: "20px",
    borderRadius: "15px",
    maxWidth: "600px",
    margin: "auto",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #2d2d2d",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    outline: "none",
  };

  const qrContainerStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    display: "inline-block",
    margin: "20px 0",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px" }}>
        Generate QR Code
      </h2>

      {!walletConnected ? (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={connectWallet}
            style={{ ...buttonStyle, backgroundColor: "#2196F3" }}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <p style={{ color: "#4CAF50", marginBottom: "15px", textAlign: "center" }}>
          Wallet Connected
        </p>
      )}

      <div style={buttonContainerStyle}>
        <button
          onClick={() => {
            setShowDefaultQR(false);
            setSelectedButton("QRwithAmount"); // Set selected button
          }}
          style={selectedButton === "QRwithAmount" ? selectedButtonStyle : buttonStyle} // Apply highlighted border if selected
        >
          QR with Amount
        </button>
        <button
          onClick={() => {
            setShowDefaultQR(true);
            setSelectedButton("DefaultQR"); // Set selected button
          }}
          style={selectedButton === "DefaultQR" ? selectedButtonStyle : buttonStyle} // Apply highlighted border if selected
        >
          Default QR
        </button>
      </div>

      {!showDefaultQR && (
        <>
          <input
            type="text"
            placeholder="Receiver Address"
            value={receiverAddress}
            onChange={handleReceiverAddressChange}
            style={inputStyle}
          />
          {!isValidAddress && receiverAddress && (
            <p style={{ color: "red", fontSize: "14px" }}>
              Invalid Ethereum address.
            </p>
          )}

          <input
            type="text"
            placeholder="Amount (ETH)"
            value={amount}
            onChange={handleAmountChange}
            style={inputStyle}
          />
        </>
      )}

      <div style={{ textAlign: "center" }}>
        {receiverAddress && isValidAddress && (!showDefaultQR ? amount : true) ? (
          <div style={qrContainerStyle}>
            <QRCodeCanvas
              value={JSON.stringify({
                contract: contractAddress,
                receiver: receiverAddress,
                ...(showDefaultQR ? {} : { amount }),
              })}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        ) : (
          <p style={{ color: "#888", fontSize: "14px" }}>
            {walletConnected
              ? "Fill in the details to generate a QR code"
              : "Connect your wallet to generate the QR code"}
          </p>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;


