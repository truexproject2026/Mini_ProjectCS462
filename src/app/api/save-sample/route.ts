import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const label = formData.get('label') as string;
    const imageData = formData.get('image_data') as string;

    if (!label || !imageData) {
      return NextResponse.json({ status: 'error', message: 'Missing data' }, { status: 400 });
    }

    try {
      // ส่งรูปขึ้น Cloudinary โดยแยกโฟลเดอร์ตามตัวเลขไทย
      const uploadResponse = await cloudinary.uploader.upload(imageData, {
        folder: `thai-handwriting/${label}`,
        resource_type: 'image',
        public_id: `${label}_${Date.now()}`
      });

      return NextResponse.json({ 
        status: 'success', 
        message: `Saved to Cloudinary in folder: ${label}`,
        url: uploadResponse.secure_url
      });

    } catch (cloudErr: any) {
      console.error("Cloudinary Error:", cloudErr);
      return NextResponse.json({ 
        status: 'error', 
        message: `Cloudinary Upload Failed: ${cloudErr.message}` 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("System Error:", error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
