import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ status: 'error', message: 'No file uploaded' }, { status: 400 });
    }

    // 1. เตรียมส่งไฟล์ต่อไปยัง Python Backend (Render.com)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // สร้าง FormData ใหม่เพื่อส่งต่อให้ Python
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    try {
      // 2. ส่งไฟล์ไปยัง Endpoint /upload-model ของ Python Backend
      const pythonResponse = await fetch(`${backendUrl}/upload-model`, {
        method: 'POST',
        body: pythonFormData,
      });

      if (pythonResponse.ok) {
        const result = await pythonResponse.json();
        return NextResponse.json({ 
          status: 'success', 
          filename: file.name,
          message: 'Model uploaded to Cloud Backend and reloaded successfully' 
        });
      } else {
        const errorText = await pythonResponse.text();
        throw new Error(`Backend Error: ${errorText}`);
      }
    } catch (err: any) {
      console.error("Failed to forward model to Python backend:", err);
      throw new Error(`ไม่สามารถเชื่อมต่อ AI Backend ได้: ${err.message}`);
    }

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
