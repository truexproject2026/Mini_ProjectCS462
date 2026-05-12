# CS462 Data Analytics and Mining - Project Summary

ไฟล์นี้สรุปสถานะล่าสุดของโปรเจค เพื่อให้ AI ในรอบถัดไปเข้าใจโครงสร้างและทำงานต่อได้ทันที

## 🏗️ 1. Current Architecture (Hybrid Cloud)
ระบบถูกแยกการทำงานออกเป็น 2 ส่วนหลักเพื่อประสิทธิภาพสูงสุด:
- **Frontend:** [Next.js] ฝากไว้ที่ **Vercel** (`https://cs462-327a-ramnoi-36-40.vercel.app/`)
- **AI Backend:** [FastAPI] ฝากไว้ที่ **Render.com** (`https://mini-pj-online.onrender.com`)
- **Image Storage:** ใช้ **Cloudinary** ในการเก็บรูปภาพ Dataset ถาวร (แยกโฟลเดอร์ ๓๖-๔๐)

## 🚀 2. Key Features & Workflows

### 🎯 Real-time Prediction (หน้าหลัก)
- วาดตัวเลขบน Canvas -> Frontend ส่งรูปไปที่ Render Backend
- AI ทำนายผลด้วยโมเดล Random Forest / ExtraTrees (`current_model.pkl`)
- **Current Version:** V8.3 (Accuracy: 96.93%) - เพิ่มความแม่นยำด้วยข้อมูลใหม่รวมเป็น 2,000+ รูป (Augmented เป็น 10,413 รูป)
- ปรับสมดุลข้อมูลเลข **๓๘** (เพิ่มจาก 159 เป็น 414 รูป) ทำให้โมเดลเสถียรขึ้นมาก
- ส่งผลลัพธ์พร้อมค่า Confidence กลับมาโชว์ทันที

### 📁 Persistent Data Collection (หน้า /dataset)
- ผู้ใช้วาดรูปและเลือก Label (๓๖-๔๐)
- ระบบส่งรูปภาพตรงไปที่ **Cloudinary** (แก้ปัญหา Vercel ไม่เก็บไฟล์)
- **Dataset Update:** เพิ่มข้อมูลเลข **๓๖** เป็น 285 รูป (เดิม 59) เพื่อแก้ปัญหา Data Imbalance
- **Auto-Clear:** กระดานวาดรูปจะล้างให้อัตโนมัติหลังกดบันทึกสำเร็จ

### 🧠 Dynamic Model Update (Admin Section)
- **Real-time Upload:** อัปโหลดไฟล์ `.pkl` ใหม่ผ่านหน้าเว็บได้เลย
- **Bypass Vercel Limits:** ระบบส่งไฟล์ตรงจาก Browser ไปยัง Render
- **Memory Reload:** AI Backend จะโหลดโมเดลใหม่เข้าหน่วยความจำทันที

## ⚡ 6. Performance & Cold Start Fix
- **Keep-Alive:** ใช้ GitHub Actions (`.github/workflows/keep_alive.yml`) Ping ไปที่ Backend ทุก 10 นาที เพื่อไม่ให้ Render Free Tier หลับ (Sleep)
- **Pre-warming:** Frontend จะยิง Request ทันทีที่โหลดหน้าแรกเพื่อปลุก AI ล่วงหน้า
- **Health Check:** เพิ่ม Endpoint `/` ใน Backend เพื่อการตอบสนองที่รวดเร็ว (Lite-weight response)

## 🛠️ 3. Environment Variables (Vercel Settings)
ต้องตั้งค่าเหล่านี้ใน Vercel เสมอ:
1. `BACKEND_URL`: URL ของ Render (ใช้ใน Server-side)
2. `NEXT_PUBLIC_BACKEND_URL`: URL ของ Render (ใช้ใน Client-side)
3. `CLOUDINARY_CLOUD_NAME`: ชื่อ Cloud
4. `CLOUDINARY_API_KEY`: API Key
5. `CLOUDINARY_API_SECRET`: API Secret

## 📂 4. Project Structure Memory
- `/backend/main.py`: หัวใจของ AI (Preprocessing V8: Padding 8px, No Dilation)
- `/src/app/dataset/page.tsx`: หน้าเก็บข้อมูลใหม่ (เชื่อมต่อ Cloudinary)
- `/src/app/page.tsx`: หน้าหลัก (แสดงผลประเมินโมเดลแบบ Real-time)
- `/models/`: ที่เก็บโมเดลหลัก (`current_model.pkl` และ `metrics.json`)

## ⚠️ 5. Critical Technical Notes
- **Preprocessing V8.1:** ปรับลด Padding เหลือ 8px เพื่อให้ตัวเลขใหญ่ขึ้น และปิด Dilation เพื่อรักษาหัวเลข ๓๖
- **Dependency:** AI Backend ต้องการ `python-multipart` สำหรับจัดการไฟล์
- **Render Free Tier:** มีระบบ Cold Start (ปลุก AI นาน 30-60 วินาทีในครั้งแรก)
- **Model Permanence:** การอัปโหลดผ่านหน้าเว็บเป็นค่าชั่วคราว หากต้องการเปลี่ยนถาวรต้อง Commit ลง GitHub เท่านั้น

---
*Last Updated: 2026-05-11 | Status: V8.1 Online & Highly Robust | CS462 Data Analytics and Mining*
