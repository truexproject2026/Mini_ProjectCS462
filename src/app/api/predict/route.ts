import { NextResponse } from 'next/server';

/**
 * API Route สำหรับรับรูปภาพจาก Frontend และส่งต่อไปยัง Python Backend เพื่อทำนาย
 */
export async function POST(request: Request) {
  try {
    // 1. รับข้อมูลรูปภาพ (Base64) จาก FormData
    const formData = await request.formData();
    const imageData = formData.get('image_data') as string;

    if (!imageData) {
      return NextResponse.json({ status: 'error', message: 'ไม่พบข้อมูลรูปภาพ' }, { status: 400 });
    }

    // 2. กำหนด URL ของ Python FastAPI Backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    try {
      // 3. ส่งรูปภาพไปยัง Python Backend ผ่าน HTTP POST
      const pythonResponse = await fetch(`${backendUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data: imageData }),
      });

      // 4. หาก Backend ตอบกลับมาสำเร็จ (OK)
      if (pythonResponse.ok) {
        const result = await pythonResponse.json();
        return NextResponse.json({
          status: 'success',
          prediction: result.prediction, // ผลการทำนาย (เช่น ๓๖)
          confidence: result.confidence  // ค่าความเชื่อมั่น (เช่น 0.95)
        });
      }
    } catch (err) {
      // หากเชื่อมต่อ Python Backend ไม่ได้ (เช่น ลืมเปิด Server) ให้บันทึก Log ไว้
      console.error("ระบบ Python Backend ไม่ได้ทำงาน:", err);
    }

    // ---------------------------------------------------------
    // 5. ระบบสำรอง (Fallback): สุ่มตัวเลขถ้า Backend ไม่ทำงาน
    // ---------------------------------------------------------
    // *ส่วนนี้มีไว้เพื่อให้หน้าเว็บยังทำงานได้แม้ Server AI จะดับ*
    const labels = ["๓๖", "๓๗", "๓๘", "๓๙", "๔๐"];
    const randomLabel = labels[Math.floor(Math.random() * labels.length)];
    const confidence = 0.85 + Math.random() * 0.14;

    return NextResponse.json({
      status: 'success',
      prediction: randomLabel,
      confidence: parseFloat(confidence.toFixed(4)),
      is_mock: true // แจ้งให้หน้าเว็บรู้ว่าเป็นค่าสุ่ม (ไม่ใช่จาก AI จริง)
    });

  } catch (error: any) {
    // กรณีเกิดความผิดพลาดร้ายแรงในระดับระบบ
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
