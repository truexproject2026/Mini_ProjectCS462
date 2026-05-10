"use client";

import React, { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import Navbar from '@/components/Navbar';
import { Save, Trash2, FolderOpen } from 'lucide-react';

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
        // เคลียร์ Canvas หลังจากเซฟสำเร็จ
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
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Collect Dataset</h1>
          <p className="text-gray-600">ช่วยเราวาดตัวเลขไทยเพื่อนำไปสอน AI ให้แม่นยำขึ้น</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ส่วนควบคุม */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FolderOpen size={20} className="text-blue-500" /> เลือกตัวเลขที่จะวาด
            </h3>
            <div className="flex flex-col gap-2">
              {labels.map((label) => (
                <button
                  key={label}
                  onClick={() => setSelectedLabel(label)}
                  className={`py-3 px-4 rounded-xl text-lg font-medium transition-all ${
                    selectedLabel === label 
                    ? 'bg-blue-600 text-white shadow-md scale-105' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ตัวเลข {label}
                </button>
              ))}
            </div>
          </div>

          {/* ส่วนวาด */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-white inline-block w-full flex justify-center">
              <DrawingCanvas onCanvasExport={setCurrentImage} width={600} height={400} />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={24} /> {loading ? "กำลังบันทึก..." : `บันทึกตัวเลข ${selectedLabel}`}
              </button>
              <button 
                onClick={clearCanvas}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={24} /> ล้าง
              </button>
            </div>

            {saveStatus && (
              <div className={`p-4 rounded-xl text-center font-medium animate-bounce ${
                saveStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {saveStatus.msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
