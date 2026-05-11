"use client";

import React, { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import Navbar from '@/components/Navbar';
import { Save, Trash2, Lightbulb, Fingerprint, Database, Download, ExternalLink } from 'lucide-react';

export default function CollectData() {
  const [currentImage, setCurrentImage] = useState<string>("");
  const [selectedLabel, setSelectedLabel] = useState<string>("๓๖");
  const [brushSize, setBrushSize] = useState<number>(20); // Default to match home page
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [downloadParts, setDownloadParts] = useState<string[]>([]);

  const labels = ["๓๖", "๓๗", "๓๘", "๓๙", "๔๐"];
  const brushOptions = [
    { label: 'เส้นบาง', size: 12, icon: 'fa-pencil' },
    { label: 'ปกติ', size: 20, icon: 'fa-pen' },
    { label: 'เส้นหนา', size: 30, icon: 'fa-pen-nib' }
  ];

  const handleSave = async () => {
    if (!currentImage) return alert("กรุณาวาดตัวเลขก่อน!");
    
    setLoading(true);
    setSaveStatus(null);
    
    try {
      const formData = new FormData();
      formData.append('label', selectedLabel);
      formData.append('image_data', currentImage);

      const res = await fetch('/api/save-sample', {
        method: 'POST',
        body: formData,
      });
      
      const result = await res.json();

      if (result.status === 'success') {
        setSaveStatus({ type: 'success', msg: `บันทึกข้อมูล ${selectedLabel} สำเร็จ!` });
        if ((window as any).clearCanvas) {
          (window as any).clearCanvas();
        }
      } else {
        setSaveStatus({ type: 'error', msg: "บันทึกล้มเหลว: " + result.message });
      }
    } catch (error) {
      setSaveStatus({ type: 'error', msg: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setLoading(false);
    }
  };

  const clearCanvas = () => {
    if ((window as any).clearCanvas) {
      (window as any).clearCanvas();
    }
  };

  const handleDownload = async (label?: string) => {
    setLoading(true);
    setDownloadParts([]);
    try {
      const url = label ? `/api/download-all?label=${encodeURIComponent(label)}` : '/api/download-all';
      const res = await fetch(url);
      const result = await res.json();
      if (result.status === 'success' && result.urls) {
        if (result.urls.length === 1) {
          window.open(result.urls[0], '_blank');
          setSaveStatus({ type: 'success', msg: `ดาวน์โหลดข้อมูล ${result.label} (${result.total} รูป) สำเร็จ!` });
        } else {
          setDownloadParts(result.urls);
          setSaveStatus({ 
            type: 'success', 
            msg: `บีบอัดไฟล์ ${result.label} (${result.total} รูป) เสร็จสิ้น! กรุณากดดาวน์โหลดทีละส่วนด้านล่าง` 
          });
        }
      } else {
        alert("ไม่สามารถสร้างไฟล์ดาวน์โหลดได้ในขณะนี้: " + (result.message || ""));
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-10">
      <Navbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        
        {/* --- Refined Header --- */}
        <div className="dataset-header">
          <div style={{ position: 'absolute', top: '10px', right: '20px', opacity: 0.1 }}>
            <Database size={100} />
          </div>
          <h1>Collect Dataset</h1>
          <p>ช่วยเราวาดตัวเลขไทยเพื่อนำไปสอน AI ให้แม่นยำขึ้นกว่าเดิม</p>
        </div>

        {/* --- Label Selection (Horizontal Pills) --- */}
        <div className="label-selector">
          {labels.map((label) => (
            <button
              key={label}
              onClick={() => setSelectedLabel(label)}
              className={`label-pill ${selectedLabel === label ? 'active' : ''}`}
            >
              ตัวเลข {label}
            </button>
          ))}
        </div>

        {/* --- Brush Size Selection --- */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>ความหนาปากกา:</span>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
            {brushOptions.map((opt) => (
              <button
                key={opt.size}
                onClick={() => setBrushSize(opt.size)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: brushSize === opt.size ? '#ffffff' : 'transparent',
                  color: brushSize === opt.size ? '#4f46e5' : '#64748b',
                  boxShadow: brushSize === opt.size ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <i className={`fa-solid ${opt.icon}`} style={{ marginRight: '6px' }}></i>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="container" style={{ gridTemplateColumns: '1.4fr 0.6fr' }}>
          
          {/* --- Drawing Column --- */}
          <div className="space-y-4">
            <div className="card" style={{ padding: '10px', display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
              <DrawingCanvas onCanvasExport={setCurrentImage} width={450} height={350} lineWidth={brushSize} />
            </div>

            <div className="btn-group" style={{ gap: '12px' }}>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="predict-btn"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981, #059669)', 
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  borderRadius: '100px',
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '8px' }}></i>
                {loading ? "Saving..." : `Save ${selectedLabel}`}
              </button>
              <button 
                onClick={clearCanvas}
                className="clear-btn"
                style={{ 
                  borderRadius: '100px',
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fa-solid fa-trash-can" style={{ marginRight: '8px' }}></i>
                Clear
              </button>
            </div>

            {saveStatus && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '14px', 
                textAlign: 'center', 
                fontSize: '13px',
                fontWeight: 600,
                background: saveStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                color: saveStatus.type === 'success' ? '#166534' : '#991b1b',
                border: `1px solid ${saveStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                animation: 'fadeIn 0.3s ease-out'
              }}>
                {saveStatus.msg}
              </div>
            )}
          </div>

          {/* --- Info Column --- */}
          <div className="space-y-4">
            <div className="card">
              <div className="tips-title">
                <Lightbulb size={16} /> Drawing Tips
              </div>
              <ul className="tips-text" style={{ paddingLeft: '15px', listStyleType: 'disc' }}>
                <li>วาดให้ตัวเลขอยู่กึ่งกลางพื้นที่</li>
                <li>ใช้ความเร็วในการวาดปกติ</li>
                <li>เน้นวาด "หาง" ของเลข ๓๘ และ ๓๙ ให้ชัดเจน</li>
                <li>วาดหลายๆ รูปแบบ (ตัวเอียง, ตัวหนา, ตัวบาง)</li>
              </ul>
            </div>

            <div className="card" style={{ background: '#eff6ff', borderColor: '#dbeafe' }}>
              <div className="tips-title" style={{ color: '#1e40af' }}>
                <Fingerprint size={16} /> Dataset Info
              </div>
              <p className="tips-text" style={{ color: '#1e40af' }}>
                ข้อมูลของคุณจะถูกอัปโหลดไปยัง Cloudinary และใช้ในการ Re-train โมเดลในอนาคตเพื่อเพิ่มความแม่นยำ
              </p>
            </div>

            {/* --- Google Drive Download (Temporary) --- */}
            <div className="card" style={{ padding: '18px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '24px' }}>
              <div className="tips-title" style={{ color: '#92400e', marginBottom: '12px' }}>
                <ExternalLink size={16} /> Dataset Download
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '13px', color: '#b45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-circle-info"></i>
                  * ข้อมูลใน Drive จะถูกอัปเดตเป็นระยะ
                </p>
              </div>

              <a 
                href="https://drive.google.com/drive/folders/1xJnM2Jw9gkFWNW5ziXPfY8kxUypV-ECo?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  width: '100%',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '100px',
                  padding: '14px 20px',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Download size={18} style={{ marginRight: '8px' }} />
                Open Google Drive
              </a>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
