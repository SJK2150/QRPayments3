import React, { useState, useEffect, useRef, useCallback } from "react";
import { ethers } from "ethers";
import QrReader from "react-qr-reader";

const QRCodeReader = ({ onScan = () => {}, defaultQR }) => {
  const [cameraAccessGranted, setCameraAccessGranted] = useState(false);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [amount, setAmount] = useState("");
  const videoRef = useRef(null);

  // All existing callback functions and effects remain unchanged
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
    // Payment logic remains unchanged
    console.log("Payment initiated with data:", qrCodeData);
    
    if (!qrCodeData) {
      console.error("No QR code data available");
      setError("No QR code data available for payment.");
      return;
    }

    const { receiver, amount: qrAmount } = qrCodeData;
    const finalAmount = qrAmount || amount;
    
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to proceed.");
        return;
      }

      if (!ethers.utils.isAddress(receiver)) {
        setError("Invalid Ethereum address.");
        return;
      }

      if (!finalAmount || isNaN(finalAmount) || parseFloat(finalAmount) <= 0) {
        setError("Enter a valid amount.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const amountInWei = ethers.utils.parseEther(finalAmount.toString());
      
      const transaction = {
        to: receiver,
        value: amountInWei,
      };

      const tx = await signer.sendTransaction(transaction);
      alert(`Transaction sent! TX Hash: ${tx.hash}`);
    } catch (err) {
      setError(`Payment failed: ${err.message || 'Unknown error'}`);
    }
  };

  const styles = {
    container: {
      backgroundImage: 'url("/background.png")',
      backgroundColor: "#0B062B",
      backgroundSize: "cover",
      color: "white",
      padding: "20px",
      borderRadius: "15px",
      maxWidth: "600px",
      margin: "auto",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
    },
    title: {
      textAlign: "center",
      fontSize: "24px",
      marginBottom: "20px",
    },
    error: {
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      border: "1px solid #ff0000",
      padding: "10px",
      borderRadius: "5px",
      marginBottom: "20px",
      color: "#ff0000",
      textAlign: "center",
    },
    cameraWarning: {
      color: "#ffd700",
      textAlign: "center",
      marginBottom: "15px",
    },
    videoContainer: {
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      padding: "10px",
      borderRadius: "10px",
      overflow: "hidden",
      marginBottom: "20px",
    },
    video: {
      width: "100%",
      height: "300px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "5px",
    },
    qrReader: {
      width: "100%",
    },
    dataContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      padding: "15px",
      borderRadius: "5px",
      marginBottom: "15px",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "15px",
      borderRadius: "5px",
      border: "1px solid #2d2d2d",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "white",
    },
    buttonContainer: {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
    },
    button: {
      padding: "12px 24px",
      borderRadius: "5px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      color: "white",
      transition: "opacity 0.3s",
    },
    payButton: {
      backgroundColor: "#4CAF50",
    },
    scanButton: {
      backgroundColor: "#f44336",
    },
    defaultButton: {
      backgroundColor: "#2196F3",
      margin: "20px auto",
      display: "block",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Scan QR Code</h2>

      {error && <div style={styles.error}>{error}</div>}

      {!cameraAccessGranted && (
        <p style={styles.cameraWarning}>
          Camera permission is required to scan the QR code.
        </p>
      )}

      {!qrCodeData && (
        <div>
          <h3 style={styles.title}>Live Camera Feed</h3>
          <div style={styles.videoContainer}>
            
            <QrReader
              legacyMode={false}
              delay={300}
              onScan={handleScan}
              onError={handleError}
              style={styles.qrReader}
            />
          </div>
        </div>
      )}

      {qrCodeData && (
        <div>
          <h3 style={styles.title}>Scanned QR Code Data</h3>
          <pre style={styles.dataContainer}>
            {JSON.stringify(qrCodeData, null, 2)}
          </pre>
          {!qrCodeData.amount && (
            <input
              type="text"
              placeholder="Enter amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
            />
          )}
          <div style={styles.buttonContainer}>
            <button
              onClick={handlePayment}
              style={{ ...styles.button, ...styles.payButton }}
            >
              Pay
            </button>
            <button
              onClick={resetScanner}
              style={{ ...styles.button, ...styles.scanButton }}
            >
              Scan Again
            </button>
          </div>
        </div>
      )}

      {defaultQR && !qrCodeData && (
        <button
          onClick={scanDefaultQR}
          style={{ ...styles.button, ...styles.defaultButton }}
        >
          Scan Default QR
        </button>
      )}
    </div>
  );
};

export default QRCodeReader;


