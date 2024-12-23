import React, { useState, useEffect, useRef, useCallback } from "react";
import { QrReader } from "react-qr-reader";
import { ethers } from "ethers";

const QRCodeReader = ({ onScan, defaultQR }) => {
  const [cameraAccessGranted, setCameraAccessGranted] = useState(false);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [amount, setAmount] = useState(""); // User-input for the transaction amount
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

  const handleScan = useCallback(
    (result) => {
      if (result) {
        try {
          const scannedData = result.getText();
          const parsedData = JSON.parse(scannedData);
          setQrCodeData(parsedData);

          stopCamera();  // Stop the camera after scan

          if (onScan) {
            onScan(parsedData);
          }

          console.log("Scanned QR Code Data:", parsedData);
        } catch (err) {
          console.error("Error parsing QR code data:", err);
          setError("Invalid QR code data format.");
        }
      }
    },
    [onScan, stopCamera]
  );

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
    } catch (err) {
      console.error("Error parsing default QR code data:", err);
      setError("Invalid default QR code format.");
    }
  };

  const handlePayment = async () => {
    if (qrCodeData) {
      const { receiver, amount: qrAmount } = qrCodeData;
      const finalAmount = qrAmount || amount; 

      if (!ethers.utils.isAddress(receiver)) {
        setError("Invalid Ethereum address.");
        return;
      }

      if (!finalAmount || isNaN(finalAmount) || parseFloat(finalAmount) <= 0) {
        setError("Enter a valid amount.");
        return;
      }

      try {
        if (!window.ethereum) {
          alert("MetaMask is not installed. Please install it to proceed.");
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum); // Updated provider
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const amountInWei = ethers.utils.parseEther(finalAmount); // Updated method

        const tx = await signer.sendTransaction({
          to: receiver,
          value: amountInWei,
        });

        console.log("Transaction sent:", tx);
        alert(`Transaction sent! TX Hash: ${tx.hash}`);
      } catch (err) {
        console.error("Payment error:", err);
        setError("Payment failed. Please try again.");
      }
    } else {
      setError("No QR code data available for payment.");
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
            constraints={{ facingMode: "environment" }}
            scanDelay={300}
            onResult={handleScan}
            onError={handleError}
            videoStyle={{ width: "100%" }}
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
