import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const label = formData.get('label') as string;
    const imageData = formData.get('image_data') as string;

    if (!label || !imageData) {
      return NextResponse.json({ status: 'error', message: 'Missing data' }, { status: 400 });
    }

    // Prepare directory
    const datasetDir = path.join(process.cwd(), 'dataset', label);
    if (!fs.existsSync(datasetDir)) {
      fs.mkdirSync(datasetDir, { recursive: true });
    }

    // Decode base64
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate filename based on timestamp to avoid conflicts
    const timestamp = Date.now();
    const filename = `${label}_${timestamp}.png`;
    const filepath = path.join(datasetDir, filename);

    // Save file to local disk
    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({ 
      status: 'success', 
      message: `Saved to local: dataset/${label}/${filename}` 
    });
  } catch (error: any) {
    console.error("Local Save Error:", error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
