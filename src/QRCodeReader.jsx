import React, { useState, useEffect, useRef, useCallback } from "react";
import { ethers } from "ethers";
import QrReader from "react-qr-reader";

const QRCodeReader = ({ onScan = () => {}, defaultQR }) => {
  const [cameraAccessGranted, setCameraAccessGranted] = useState(false);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [amount, setAmount] = useState("");
  const videoRef = useRef(null);

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            if (err.name !== "AbortError") {
              console.error("Error playing video:", err);
            }
          });
        };
        setCameraAccessGranted(true);
        setError(null);
      }
    } catch (err) {
      console.error("Camera permission error:", err);
      setError("Camera access denied. Please grant camera permission.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  }, []);

  useEffect(() => {
    requestCameraPermission();
    return () => stopCamera();
  }, [requestCameraPermission, stopCamera]);

  const handleScan = useCallback((data) => {
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setQrCodeData(parsedData);
        stopCamera();
        onScan(parsedData);
        console.log("Scanned QR Code Data:", parsedData);
      } catch (err) {
        console.error("Error parsing QR code data:", err);
        setError("Invalid QR code data format.");
      }
    }
  }, [onScan, stopCamera]);

  const handleError = useCallback((err) => {
    console.error("QR code scan error:", err);
    setError("Error scanning QR code. Please try again.");
  }, []);

  const resetScanner = () => {
    setQrCodeData(null);
    setAmount("");
    setError(null);
    requestCameraPermission();
  };

  const scanDefaultQR = () => {
    try {
      const parsedData = JSON.parse(defaultQR);
      setQrCodeData(parsedData);
      onScan(parsedData);
    } catch (err) {
      console.error("Error parsing default QR code data:", err);
      setError("Invalid default QR code format.");
    }
  };

const handlePayment = async () => {
    console.log("Payment initiated with data:", qrCodeData);
    
    if (!qrCodeData) {
      console.error("No QR code data available");
      setError("No QR code data available for payment.");
      return;
    }

    const { receiver, amount: qrAmount } = qrCodeData;
    const finalAmount = qrAmount || amount;
    
    console.log("Processing payment:", {
      receiver,
      qrAmount,
      userAmount: amount,
      finalAmount
    });

    try {
      // Check MetaMask installation
      if (!window.ethereum) {
        console.error("MetaMask not found");
        alert("MetaMask is not installed. Please install it to proceed.");
        return;
      }
      console.log("MetaMask detected");

      // Validate address
      if (!ethers.utils.isAddress(receiver)) {
        console.error("Invalid address:", receiver);
        setError("Invalid Ethereum address.");
        return;
      }
      console.log("Address validated");

      // Validate amount
      if (!finalAmount || isNaN(finalAmount) || parseFloat(finalAmount) <= 0) {
        console.error("Invalid amount:", finalAmount);
        setError("Enter a valid amount.");
        return;
      }
      console.log("Amount validated");

      // Initialize provider
      console.log("Initializing Web3 provider");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request account access
      console.log("Requesting account access");
      await provider.send("eth_requestAccounts", []);
      
      // Get signer
      console.log("Getting signer");
      const signer = await provider.getSigner();
      
      // Convert amount to Wei
      console.log("Converting amount to Wei:", finalAmount);
      const amountInWei = ethers.utils.parseEther(finalAmount.toString());
      
      // Prepare transaction
      console.log("Preparing transaction");
      const transaction = {
        to: receiver,
        value: amountInWei,
      };
      console.log("Transaction details:", transaction);

      // Send transaction
      console.log("Sending transaction");
      const tx = await signer.sendTransaction(transaction);
      
      console.log("Transaction sent successfully:", tx);
      alert(`Transaction sent! TX Hash: ${tx.hash}`);
    } catch (err) {
      console.error("Detailed payment error:", err);
      setError(`Payment failed: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="qr-reader">
      <h2>Scan QR Code</h2>

      {!cameraAccessGranted && (
        <p style={{ color: "red" }}>
          Camera permission is required to scan the QR code.
        </p>
      )}

      {!qrCodeData && (
        <div>
          <h3>Live Camera Feed</h3>
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "300px",
              border: "1px solid black",
            }}
            autoPlay
            playsInline
            muted
          ></video>
          <QrReader
            legacyMode={false}
            delay={300}
            onScan={handleScan}
            onError={handleError}
            style={{ width: "100%" }}
          />
        </div>
      )}

      {qrCodeData && (
        <div>
          <h3>Scanned QR Code Data</h3>
          <pre>{JSON.stringify(qrCodeData, null, 2)}</pre>
          {!qrCodeData.amount && (
            <input
              type="text"
              placeholder="Enter amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          )}
          <button onClick={handlePayment}>Pay</button>
          <button onClick={resetScanner}>Scan Again</button>
        </div>
      )}

      {error && (
        <div style={{ color: "red" }}>
          <p>{error}</p>
        </div>
      )}

      {defaultQR && !qrCodeData && (
        <div>
          <button onClick={scanDefaultQR}>Scan Default QR</button>
        </div>
      )}
    </div>
  );
};

export default QRCodeReader;

