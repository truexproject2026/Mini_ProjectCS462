"use client";

import React, { useState, useEffect } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import Navbar from '@/components/Navbar';
import { Sparkles, Activity, Table, Upload, FileCode, CheckCircle2, Loader2 } from 'lucide-react';

export default function Home() {
  const [currentImage, setCurrentImage] = useState<string>("");
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modelStatus, setModelStatus] = useState<string>("current_model.pkl");
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMetricsFile, setSelectedMetricsFile] = useState<File | null>(null);

  const fetchMetrics = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/metrics`);
      const result = await res.json();
      if (result.status === 'success') {
        setMetrics(result.metrics);
      }
    } catch (error) {
      console.error("โหลดข้อมูล Metrics ล้มเหลว:", error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handlePredict = async () => {
    if (!currentImage) return alert("กรุณาวาดตัวเลขก่อน!");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image_data', currentImage);

      const res = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      
      if (result.status === 'success') {
        setPrediction({
          label: result.prediction,
          confidence: result.confidence
        });
      }
    } catch (error) {
      alert("การทำนายผลขัดข้อง");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleModelUpload = async () => {
    if (!selectedFile) return alert("กรุณาเลือกไฟล์โมเดล (.pkl) ก่อน!");

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedMetricsFile) {
      formData.append('metrics_file', selectedMetricsFile);
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/upload-model`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await res.json();
      
      if (result.status === 'success') {
        setModelStatus(selectedFile.name);
        alert(`อัปโหลดสำเร็จ! ${result.has_metrics ? "พร้อมอัปเดต Metrics แล้ว" : ""}`);
        fetchMetrics();
        setSelectedFile(null);
        setSelectedMetricsFile(null);
      } else {
        alert("การอัปโหลดล้มเหลว: " + (result.message || "ไม่ทราบสาเหตุ"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("การอัปโหลดล้มเหลว: ไม่สามารถเชื่อมต่อกับ AI Server โดยตรงได้");
    } finally {
      setUploading(false);
    }
  };

  const clearCanvas = () => {
    if ((window as any).clearCanvas) {
      (window as any).clearCanvas();
    }
  };

  return (
    <>
      <Navbar />

      {/* Loading Overlay for Model Upload */}
      {uploading && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <h2 style={{color: '#4f46e5', fontWeight: 800}}>กำลังอัปโหลดโมเดล...</h2>
          <p style={{color: '#64748b', marginTop: '10px'}}>กรุณารอสักครู่ ระบบกำลังติดตั้ง AI ตัวใหม่</p>
        </div>
      )}

      <div className="container">
        {/* ================= USER PAGE ================= */}
        <div className="card">
          <div className="title">
            <div className="icon">
              <i className="fa-solid fa-signature"></i>
            </div>
            <div>
              <h2>User Page</h2>
              <div className="subtitle">วาดตัวเลข ๓๖-๔๐ แล้วกด Predict</div>
            </div>
          </div>

          <div className="canvas-box">
            <DrawingCanvas onCanvasExport={setCurrentImage} className="canvas-index" width={700} height={500} />
          </div>

          <div className="btn-group">
            <button className="predict-btn" onClick={handlePredict} disabled={loading}>
              <i className="fa-solid fa-bolt-lightning" style={{marginRight: '8px'}}></i>
              {loading ? "Analyzing..." : "Predict"}
            </button>
            <button className="clear-btn" onClick={clearCanvas}>
              <i className="fa-solid fa-eraser" style={{marginRight: '8px'}}></i>
              Clear
            </button>
          </div>

          <div className="result-box">
            <div className="result-card">
              <div className="label"><i className="fa-solid fa-bullseye" style={{marginRight: '6px'}}></i> Prediction</div>
              <div className="value">{prediction ? prediction.label : "-"}</div>
            </div>
            <div className="result-card">
              <div className="label"><i className="fa-solid fa-chart-pie" style={{marginRight: '6px'}}></i> Confidence</div>
              <div className="value">{prediction ? `${(prediction.confidence * 100).toFixed(0)}%` : "-"}</div>
            </div>
          </div>
        </div>

        {/* ================= ADMIN PAGE ================= */}
        <div className="card">
          <div className="title">
            <div className="icon dark">
              <i className="fa-solid fa-microchip"></i>
            </div>
            <div>
              <h2>Admin Page</h2>
              <div className="subtitle">จัดการโมเดล Machine Learning</div>
            </div>
          </div>

          <div className="model-box">
            <div className="model-title"><i className="fa-solid fa-file-code" style={{marginRight: '6px'}}></i> Current Model</div>
            <div className="model-name" style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981'}}>
              <CheckCircle2 size={16} /> {modelStatus}
            </div>
          </div>

          {/* Modernized Upload Area */}
          <div className={`upload-area ${selectedFile ? 'file-selected' : ''}`}>
            <input type="file" onChange={handleFileChange} accept=".pkl" />
            <div className="upload-content">
              <div className="upload-icon-box">
                {selectedFile ? <FileCode size={32} /> : <Upload size={32} />}
              </div>
              <div className="upload-text">
                <h3>{selectedFile ? selectedFile.name : "คลิกหรือลากไฟล์ .pkl มาวางที่นี่"}</h3>
                <p>{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "รองรับไฟล์โมเดลจาก Scikit-learn"}</p>
              </div>
            </div>
          </div>

          <div className="btn-group-column" style={{marginTop: '20px'}}>
            <button className="upload-btn" onClick={handleModelUpload} disabled={uploading || !selectedFile}>
              <i className="fa-solid fa-cloud-arrow-up" style={{marginRight: '8px'}}></i>
              {uploading ? "กำลังติดตั้ง..." : "Deploy New Model"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
