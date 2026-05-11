import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // 1. สร้าง Tag พิเศษหรือใช้ Folder ชื่อ 'thai-handwriting' ในการรวมไฟล์
    // Cloudinary มีฟีเจอร์สร้าง Archive (ZIP) จาก Tag หรือ Folder ได้ทันที
    
    // หมายเหตุ: วิธีที่ง่ายที่สุดของ Cloudinary คือการใช้ generate_archive
    // แต่อาจต้องใช้เวลาประมวลผล เราจะส่งเป็น URL ของ ZIP กลับไป
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // สร้าง ZIP จากทุกไฟล์ที่อยู่ในโฟลเดอร์ thai-handwriting
    const zipUrl = cloudinary.utils.download_zip_url({
      prefixes: 'thai-handwriting/',
      resource_type: 'image',
      flatten_folders: false
    });

    return NextResponse.json({ 
      status: 'success', 
      url: zipUrl 
    });

  } catch (error: any) {
    console.error("Download Error:", error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}
