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
  const [isWakingUp, setIsWakingUp] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMetricsFile, setSelectedMetricsFile] = useState<File | null>(null);

  const fetchMetrics = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${backendUrl}/metrics`, { 
        cache: 'no-store'
      });
      
      if (res.ok) {
        const result = await res.json();
        if (result.status === 'success') {
          setMetrics(result.metrics);
          setIsWakingUp(false);
          console.log("✅ AI Backend is Online!");
          return true;
        }
      }
    } catch (error: any) {
      // แสดง Log เพื่อให้เราเช็คว่า URL ถูกไหม
      console.log(`⏳ กำลังรอ AI ที่: ${backendUrl}/metrics ...`);
    }
    return false;
  };

  useEffect(() => {
    // ครั้งแรกที่เข้าเว็บ
    fetchMetrics();
    
    // ตั้งเวลาเช็คทุกๆ 4 วินาที (แบบ Real-time ไม่ต้องรีเฟรช)
    const wakeupInterval = setInterval(async () => {
      if (isWakingUp) {
        const isOnline = await fetchMetrics();
        if (isOnline) {
          clearInterval(wakeupInterval);
        }
      }
    }, 4000);

    return () => clearInterval(wakeupInterval);
  }, [isWakingUp]);

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
            {/* System Status Indicator */}
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: isWakingUp ? '#fef3c7' : '#dcfce7',
              color: isWakingUp ? '#b45309' : '#166534',
              border: `1px solid ${isWakingUp ? '#fbbf24' : '#22c55e'}`
            }}>
              {isWakingUp ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Waking up AI...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  System Ready
                </>
              )}
            </div>
          </div>

          <div className="canvas-box">
            <DrawingCanvas onCanvasExport={setCurrentImage} className="canvas-index" width={400} height={300} lineWidth={13} />
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
              <div className="subtitle">จัดการโมเดลและดูประสิทธิภาพ (Evaluation)</div>
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

          {/* Evaluation Metrics Display (Moved below upload) */}
          {metrics && (
            <div style={{ marginTop: '30px', borderTop: '2px dashed #e2e8f0', paddingTop: '25px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} /> Model Evaluation Results
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px', fontWeight: 500 }}>
                (ข้อมูลประสิทธิภาพล่าสุดจากโมเดลหลัก: <span style={{color: '#4f46e5', fontWeight: 700}}>{modelStatus}</span>)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div style={{ padding: '15px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 600 }}>OVERALL ACCURACY</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0ea5e9' }}>{(metrics.accuracy * 100).toFixed(2)}%</div>
                </div>
                <div style={{ padding: '15px', background: '#fdf2f8', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
                  <div style={{ fontSize: '12px', color: '#9d174d', fontWeight: 600 }}>WEIGHTED F1-SCORE</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#db2777' }}>{(metrics.f1_score * 100).toFixed(2)}%</div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '8px' }}>Class</th>
                      <th style={{ padding: '8px' }}>Precision</th>
                      <th style={{ padding: '8px' }}>Recall</th>
                      <th style={{ padding: '8px' }}>F1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.labels.map((label: string) => (
                      <tr key={label} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontWeight: 700 }}>{label}</td>
                        <td style={{ padding: '8px' }}>{(metrics.report[label].precision * 100).toFixed(1)}%</td>
                        <td style={{ padding: '8px' }}>{(metrics.report[label].recall * 100).toFixed(1)}%</td>
                        <td style={{ padding: '8px' }}>{(metrics.report[label]["f1-score"] * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Simple Error Analysis Logic */}
              <div style={{ marginTop: '15px', padding: '12px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> AI Insight: Error Analysis
                </div>
                <p style={{ fontSize: '12px', color: '#b45309', marginTop: '5px' }}>
                  {metrics.report["๓๘"].precision < 0.9 || metrics.report["๓๙"].recall < 0.9 
                    ? "โมเดลอาจสับสนระหว่างเลข ๓๘ และ ๓๙ เนื่องจากมีลักษณะหางที่คล้ายกัน" 
                    : "โมเดลมีความแม่นยำสูงในทุก Class แต่อาจต้องระวังการวาดหัวเลข ๓๖"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
