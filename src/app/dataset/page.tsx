"use client";

import React, { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import Navbar from '@/components/Navbar';
import { Save, Trash2, Lightbulb, Fingerprint, Database } from 'lucide-react';

export default function CollectData() {
  const [currentImage, setCurrentImage] = useState<string>("");
  const [selectedLabel, setSelectedLabel] = useState<string>("๓๖");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const labels = ["๓๖", "๓๗", "๓๘", "๓๙", "๔๐"];

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

        <div className="container" style={{ gridTemplateColumns: '1.4fr 0.6fr' }}>
          
          {/* --- Drawing Column --- */}
          <div className="space-y-4">
            <div className="card" style={{ padding: '10px', display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
              <DrawingCanvas onCanvasExport={setCurrentImage} width={450} height={350} />
            </div>

            <div className="btn-group">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="predict-btn"
                style={{ background: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
              >
                <i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '8px' }}></i>
                {loading ? "Saving..." : `Save ${selectedLabel}`}
              </button>
              <button 
                onClick={clearCanvas}
                className="clear-btn"
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
          </div>

        </div>

      </div>
    </main>
  );
}
