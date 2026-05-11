import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const label = searchParams.get('label'); // เช่น ๓๖, ๓๗ หรือ null

    let allPublicIds: string[] = [];

    if (label) {
      // --- กรณีโหลดรายคลาส: โหลดเเค่ 100 รายการล่าสุด ---
      // ใช้ search API หรือ Admin API พร้อมการจัดเรียง
      const result: any = await cloudinary.api.resources({
        type: 'upload',
        prefix: `thai-handwriting/${label}`,
        max_results: 100,
        direction: 'desc' // ล่าสุดขึ้นก่อน
      });
      
      allPublicIds = result.resources.map((r: any) => r.public_id);

      // ถ้าไม่พบในโฟลเดอร์ ลองหาที่ Root ที่ขึ้นต้นด้วย Label
      if (allPublicIds.length === 0) {
        const rootResult: any = await cloudinary.api.resources({
          type: 'upload',
          prefix: label,
          max_results: 100,
          direction: 'desc'
        });
        allPublicIds = rootResult.resources.map((r: any) => r.public_id);
      }
    } else {
      // --- กรณีโหลดทั้งหมด: โหลดทุกอย่างแบบ Batch (Full Backup) ---
      let nextCursor: string | undefined = undefined;
      do {
        const result: any = await cloudinary.api.resources({
          type: 'upload',
          max_results: 500,
          next_cursor: nextCursor
        });
        const ids = result.resources.map((r: any) => r.public_id);
        allPublicIds = [...allPublicIds, ...ids];
        nextCursor = result.next_cursor;
      } while (nextCursor);
    }

    if (allPublicIds.length === 0) {
      return NextResponse.json({ 
        status: 'error', 
        message: label ? `ไม่พบไฟล์ข้อมูลของคลาส ${label}` : 'ไม่พบไฟล์ข้อมูลใน Cloudinary' 
      });
    }

    // 2. สร้างไฟล์ ZIP
    const BATCH_SIZE = 1000;
    const batchPromises = [];

    // ถ้าเป็นรายคลาส (Max 100) จะมีแค่ Batch เดียวแน่นอน
    for (let i = 0; i < allPublicIds.length; i += BATCH_SIZE) {
      const batch = allPublicIds.slice(i, i + BATCH_SIZE);
      const batchIndex = (i / BATCH_SIZE) + 1;
      const labelPrefix = label ? `${label}_latest_` : 'full_backup_';
      
      batchPromises.push(
        cloudinary.uploader.create_zip({
          public_ids: batch,
          resource_type: 'image',
          target_public_id: `dataset_${labelPrefix}${Date.now()}_part${batchIndex}`,
          flatten_folders: false
        })
      );
    }

    const results = await Promise.all(batchPromises);
    const downloadUrls = results
      .filter(result => result && result.secure_url)
      .map(result => result.secure_url);

    return NextResponse.json({ 
      status: 'success', 
      urls: downloadUrls,
      total: allPublicIds.length,
      label: label ? `${label} (100 ล่าสุด)` : 'ทั้งหมด (Full Backup)'
    });

  } catch (error: any) {
    console.error("Download Error:", error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}
