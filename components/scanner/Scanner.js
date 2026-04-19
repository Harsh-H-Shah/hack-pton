'use client';
import { useRef, useState, useCallback } from 'react';

export default function Scanner({ onScan, loading }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onScan(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const openCamera = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      // attach stream after state update renders the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 50);
    } catch {
      setCameraError(true);
      // fall back to native file picker with capture
      fileInputRef.current?.click();
    }
  }, []);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    closeCamera();
    setPreview(base64);
    onScan(base64);
  }, [closeCamera, onScan]);

  return (
    <div className="scanner">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden file input fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {cameraOpen ? (
        <div className="camera-viewfinder">
          <video ref={videoRef} playsInline muted className="camera-video" />
          <div className="camera-controls">
            <button className="camera-cancel-btn" onClick={closeCamera}>✕</button>
            <button className="camera-capture-btn" onClick={capture} />
          </div>
        </div>
      ) : (
        <>
          <button
            className="scan-btn"
            onClick={openCamera}
            disabled={loading}
          >
            {loading ? (
              <span>🔍 Analyzing...</span>
            ) : (
              <><span className="scan-btn-icon">📷</span><span>Scan Product</span></>
            )}
          </button>

          <label className="scan-file-label">
            or drop / select a file
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
          </label>
        </>
      )}

      {preview && !cameraOpen && (
        <div className="scan-preview">
          <img src={preview} alt="Product preview" />
        </div>
      )}
    </div>
  );
}
