'use client';
import { useRef, useState } from 'react';

export default function Scanner({ onScan, loading }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setPreview(base64);
      onScan(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="scanner">
      {/* Hidden file input — capture="environment" opens rear camera on phones */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      <button
        className="scan-btn"
        onClick={() => inputRef.current.click()}
        disabled={loading}
      >
        {loading ? (
          <span>🔍 Analyzing...</span>
        ) : (
          <><span className="scan-btn-icon">📷</span><span>Scan Product</span></>
        )}
      </button>

      {/* Desktop file picker fallback */}
      <label className="scan-file-label">
        or drop / select a file
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
      </label>

      {preview && (
        <div className="scan-preview">
          <img src={preview} alt="Product preview" />
        </div>
      )}
    </div>
  );
}
