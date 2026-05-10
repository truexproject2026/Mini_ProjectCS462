import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ตั้งค่า Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const label = formData.get('label') as string;
    const imageData = formData.get('image_data') as string;

    if (!label || !imageData) {
      return NextResponse.json({ status: 'error', message: 'Missing data' }, { status: 400 });
    }

    // Decode base64
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const timestamp = Date.now();
    const filename = `${label}_${timestamp}.png`;

    // แปลงชื่อ Label เป็นภาษาอังกฤษสำหรับโฟลเดอร์และชื่อไฟล์บน Cloud เพื่อป้องกันบัค
    const labelMap: { [key: string]: string } = {
      "๓๖": "36", "๓๗": "37", "๓๘": "38", "๓๙": "39", "๔๐": "40"
    };
    const englishLabel = labelMap[label] || "unknown";
    const cloudFilename = `${englishLabel}_${timestamp}.png`;

    // --- ส่วนที่ 1: เซฟลง Cloud (Supabase) ถ้ามีการตั้งค่าไว้ ---
    if (supabase) {
      const { data, error } = await supabase.storage
        .from('datasets')
        .upload(`${englishLabel}/${cloudFilename}`, buffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (error) {
        console.error("Supabase Upload Error:", error);
        return NextResponse.json({ 
          status: 'error', 
          message: `Cloud Save Failed: ${error.message} (Check if bucket 'datasets' exists)` 
        }, { status: 500 });
      } else {
        return NextResponse.json({ 
          status: 'success', 
          message: `Saved to Cloud: datasets/${label}/${filename}`,
          path: data.path
        });
      }
    }

    // --- ส่วนที่ 2: เซฟลงเครื่อง (Local) เป็นแผนสำรอง หรือสำหรับเครื่องตัวเอง ---
    // หมายเหตุ: บน Vercel ส่วนนี้จะทำงานแต่ไฟล์จะหายไปเมื่อ Redeploy
    try {
      const datasetDir = path.join(process.cwd(), 'dataset', label);
      if (!fs.existsSync(datasetDir)) {
        fs.mkdirSync(datasetDir, { recursive: true });
      }
      const filepath = path.join(datasetDir, filename);
      fs.writeFileSync(filepath, buffer);
      
      return NextResponse.json({ 
        status: 'success', 
        message: `Saved to local: dataset/${label}/${filename} (Cloud not configured)` 
      });
    } catch (localErr) {
      console.warn("Local save failed (expected on Vercel):", localErr);
      return NextResponse.json({ 
        status: 'error', 
        message: 'Could not save to Cloud or Local' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Save Error:", error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
