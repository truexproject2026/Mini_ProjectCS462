"use client";

import React, { useState, useEffect } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import Navbar from '@/components/Navbar';
import { Sparkles, Activity, Table } from 'lucide-react';

export default function Home() {
  const [currentImage, setCurrentImage] = useState<string>("");
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<string>("current_model.pkl");
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMetricsFile, setSelectedMetricsFile] = useState<File | null>(null);

  const fetchMetrics = async () => {
    try {
      // ดึงค่าจาก Render Backend โดยตรง (ผ่าน NEXT_PUBLIC_BACKEND_URL)
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

  const handleMetricsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedMetricsFile(e.target.files[0]);
    }
  };

  const handleModelUpload = async () => {
    if (!selectedFile) return alert("กรุณาเลือกไฟล์โมเดล (.pkl) ก่อน!");

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedMetricsFile) {
      formData.append('metrics_file', selectedMetricsFile);
    }

    try {
      // 1. ลองดึงค่า URL ของ Backend (ต้องตั้งค่าใน Vercel เป็น NEXT_PUBLIC_BACKEND_URL)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      // 2. ส่งไฟล์ไปหา Render โดยตรง (ข้าม Vercel เพื่อเลี่ยงลิมิต 4.5MB)
      const res = await fetch(`${backendUrl}/upload-model`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await res.json();
      
      if (result.status === 'success') {
        setModelStatus(selectedFile.name);
        alert(`อัปโหลดสำเร็จ! ${result.has_metrics ? "พร้อมอัปเดต Metrics แล้ว" : ""}`);
        fetchMetrics(); // โหลด Metrics ใหม่ทันที
        setSelectedMetricsFile(null); // เคลียร์ไฟล์หลังจากอัปโหลด
      } else {
        alert("การอัปโหลดล้มเหลว: " + (result.message || "ไม่ทราบสาเหตุ"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("การอัปโหลดล้มเหลว: ไม่สามารถเชื่อมต่อกับ AI Server โดยตรงได้");
    } finally {
      setLoading(false);
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
            <DrawingCanvas onCanvasExport={setCurrentImage} className="canvas-index" width={400} height={400} />
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
            <div className="model-name">{modelStatus}</div>
          </div>

          <div className="upload-box">
            <div className="upload-icon"><i className="fa-solid fa-file-arrow-up"></i></div>
            <div className="upload-model">
              <h3>{selectedFile ? selectedFile.name : "Upload New Model"}</h3>
              <p>เลือกไฟล์โมเดล (.pkl)</p>
              <input type="file" className="input-type" onChange={handleFileChange} accept=".pkl" />
            </div>
          </div>

          <div className="btn-group-column">
            <button className="upload-btn" onClick={handleModelUpload} disabled={loading || !selectedFile}>
              <i className="fa-solid fa-upload" style={{marginRight: '8px'}}></i>
              {loading ? "Uploading..." : "Upload & Update"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
