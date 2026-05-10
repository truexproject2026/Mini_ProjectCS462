"use client";

import React, { useRef, useState, useEffect } from 'react';

// กำหนดคุณสมบัติ (Props) ของ Component
interface DrawingCanvasProps {
  onCanvasExport: (dataUrl: string) => void; 
  width?: number;  
  height?: number; 
  className?: string; // Add className prop
}

export default function DrawingCanvas({ 
  onCanvasExport, 
  width = 600, 
  height = 400,
  className = "canvas-index" 
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Expose clear function to window for the "Clear" buttons in HTML
  useEffect(() => {
    (window as any).clearCanvas = clearCanvas;
    (window as any).clearDatasetCanvas = clearCanvas;
  }, []);

  // ตั้งค่าเริ่มต้นเมื่อ Component ถูกโหลด
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ตั้งค่าปากกา (V6 Update: ปรับเป็น 24 เพื่อไม่ให้หัวเลข 36 ตัน)
    ctx.lineWidth = 24;      // ความหนาเส้น
    ctx.lineCap = 'round';   // ปลายเส้นมน
    ctx.strokeStyle = '#000000'; // สีดำ

    // เติมพื้นหลังสีขาว (เพื่อให้ AI ประมวลผลได้ดีกว่าพื้นหลังใส)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // ฟังก์ชันคำนวณตำแหน่งเมาส์/นิ้ว บน Canvas
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // รองรับทั้งเมาส์ (clientX) และการสัมผัส (touches)
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // คำนวณอัตราส่วนการย่อ/ขยายของ CSS เพื่อให้ตำแหน่งวาดตรงกับตำแหน่งเมาส์จริง
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // เริ่มต้นการวาด (เมื่อกดเมาส์ลง)
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  // กระบวนการวาด (เมื่อลากเมาส์)
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    if ('touches' in e) e.preventDefault(); // ป้องกันการเลื่อนหน้าจอขณะวาดบนมือถือ
    
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  // หยุดการวาด (เมื่อปล่อยเมาส์) และส่งข้อมูลภาพออกไป
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        // ส่งภาพในรูปแบบ Base64 (Data URL) ไปยังหน้าหลัก
        onCanvasExport(canvas.toDataURL('image/png'));
      }
    }
  };

  // ล้างกระดานวาดรูป
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onCanvasExport(""); // ส่งค่าว่างออกไป
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className={`${className} touch-none cursor-crosshair`}
    />
  );
}
