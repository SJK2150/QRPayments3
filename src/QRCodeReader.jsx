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
      // Enumerate devices to find the back camera
      const devices = await navigator.mediaDevices.enumerateDevices();
      const backCamera = devices.find(
        (device) => device.kind === "videoinput" && device.label.toLowerCase().includes("back")
      );

      // If no back camera is found, fall back to front camera
      const videoDevice = backCamera || devices.find((device) => device.kind === "videoinput");

      if (videoDevice) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: videoDevice.deviceId,  // Set the back camera or first available camera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
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
        }

        setCameraAccessGranted(true);
        setError(null);
      } else {
        console.error("No camera found.");
        setError("No video input devices found.");
      }
    } catch (err) {
      console.error("Camera permission error:", err);
      setError("Camera access denied. Please grant camera permission.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const tracks = document.querySelector("video")?.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
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
      finalAmount,
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
    <div
      className="min-h-screen w-full py-8 px-4"
      style={{
        backgroundImage: 'url("/background.png")',
        backgroundColor: "#0B062B",
      }}
    >
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Scan QR Code</h2>

        {!cameraAccessGranted && (
          <p className="text-red-500 text-center mb-4">
            Camera permission is required to scan the QR code.
          </p>
        )}

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {!qrCodeData && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white text-center">Live Camera Feed</h3>

            <div className="rounded-xl overflow-hidden">
              <QrReader
                legacyMode={false}
                delay={300}
                onScan={handleScan}
                onError={handleError}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        )}

        {qrCodeData && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white text-center">Transaction Details</h3>
            <div className="bg-white/20 p-4 rounded-lg text-white text-center">
              <p className="text-lg font-semibold">Receiver Address:</p>
              <p className="text-base">{qrCodeData.receiver}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg text-white text-center">
              <p className="text-lg font-semibold">Amount:</p>
              <p className="text-4xl font-extrabold text-green-400">
                {qrCodeData.amount || amount || "0.00"} ETH
              </p>
            </div>
            {!qrCodeData.amount && (
              <input
                type="text"
                placeholder="Enter amount (ETH)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handlePayment}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Pay
              </button>
              <button
                onClick={resetScanner}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Scan Again
              </button>
            </div>
          </div>
        )}

        {defaultQR && !qrCodeData && (
          <div className="mt-4 text-center">
            <button
              onClick={scanDefaultQR}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Scan Default QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeReader;
