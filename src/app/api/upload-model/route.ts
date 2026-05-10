import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ status: 'error', message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to models directory
    const modelDir = path.join(process.cwd(), 'models');
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }

    const filepath = path.join(modelDir, 'current_model.pkl');
    fs.writeFileSync(filepath, buffer);

    // 2. บอกให้ Python Backend โหลดโมเดลใหม่ (Dynamic Update)
    // ระบบจะส่งคำสั่งไปยัง Render.com เพื่อเปลี่ยนโมเดลใน Memory ทันที
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    try {
      await fetch(`${backendUrl}/reload-model`, {
        method: 'POST',
      });
    } catch (err) {
      console.error("Failed to notify Python backend to reload model:", err);
    }

    return NextResponse.json({ 
      status: 'success', 
      filename: file.name,
      message: 'Model uploaded and reloaded successfully' 
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
