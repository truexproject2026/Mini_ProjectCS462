# 🤖 Thai Handwriting ML - Project Summary & Memory (GEMINI.md)

ไฟล์นี้สรุปสถานะล่าสุดของโปรเจค เพื่อให้ AI ในรอบถัดไปเข้าใจโครงสร้างและทำงานต่อได้ทันที

## 🏗️ 1. Current Architecture (Hybrid Cloud)
ระบบถูกแยกการทำงานออกเป็น 2 ส่วนหลักเพื่อประสิทธิภาพสูงสุด:
- **Frontend:** [Next.js] ฝากไว้ที่ **Vercel** (`https://mini-pj-online.vercel.app/`)
- **AI Backend:** [FastAPI] ฝากไว้ที่ **Render.com** (`https://mini-projectcs462.onrender.com`)
- **Image Storage:** ใช้ **Cloudinary** ในการเก็บรูปภาพ Dataset ถาวร (แยกโฟลเดอร์ ๓๖-๔๐)

## 🚀 2. Key Features & Workflows

### 🎯 Real-time Prediction (หน้าหลัก)
- วาดตัวเลขบน Canvas -> Frontend ส่งรูปไปที่ Render Backend
- AI ทำนายผลด้วยโมเดล Random Forest (`current_model.pkl`)
- ส่งผลลัพธ์พร้อมค่า Confidence กลับมาโชว์ทันที

### 📁 Persistent Data Collection (หน้า /dataset)
- ผู้ใช้วาดรูปและเลือก Label (๓๖-๔๐)
- ระบบส่งรูปภาพตรงไปที่ **Cloudinary** (แก้ปัญหา Vercel ไม่เก็บไฟล์)
- **Auto-Clear:** กระดานวาดรูปจะล้างให้อัตโนมัติหลังกดบันทึกสำเร็จ

### 🧠 Dynamic Model Update (Admin Section)
- **Real-time Upload:** อัปโหลดไฟล์ `.pkl` ใหม่ผ่านหน้าเว็บได้เลย
- **Bypass Vercel Limits:** ระบบส่งไฟล์ตรงจาก Browser ไปยัง Render (เพื่อเลี่ยงลิมิต 4.5MB ของ Vercel)
- **Memory Reload:** AI Backend จะโหลดโมเดลใหม่เข้าหน่วยความจำทันทีโดยไม่ต้อง Restart

## 🛠️ 3. Environment Variables (Vercel Settings)
ต้องตั้งค่าเหล่านี้ใน Vercel เสมอ:
1. `BACKEND_URL`: URL ของ Render (ใช้ใน Server-side)
2. `NEXT_PUBLIC_BACKEND_URL`: URL ของ Render (ใช้ใน Client-side สำหรับอัปโหลดไฟล์ใหญ่)
3. `CLOUDINARY_CLOUD_NAME`: ชื่อ Cloud ใน Cloudinary
4. `CLOUDINARY_API_KEY`: API Key
5. `CLOUDINARY_API_SECRET`: API Secret

## 📂 4. Project Structure Memory
- `/backend/main.py`: หัวใจของ AI (รองรับ CORS, อัปโหลดโมเดล, และ Preprocessing)
- `/src/app/dataset/page.tsx`: หน้าเก็บข้อมูลใหม่ (เชื่อมต่อ Cloudinary)
- `/src/app/page.tsx`: หน้าหลัก (ตัดส่วน Metrics ออกเพื่อความง่ายตามความต้องการล่าสุด)
- `/models/`: ที่เก็บโมเดลหลัก (ควรมีไฟล์ `current_model.pkl` และ `metrics.json` เสมอ)

## ⚠️ 5. Critical Technical Notes
- **Supabase Storage:** เลิกใช้แล้วเนื่องจากปัญหาเรื่องภาษาไทยใน Path และความซับซ้อนของ Policy เปลี่ยนมาใช้ **Cloudinary** แทน
- **Render Free Tier:** มีระบบ Cold Start (ปลุก AI นาน 30-60 วินาทีในครั้งแรก)
- **Model Permanence:** การอัปโหลดผ่านหน้าเว็บเป็นค่าชั่วคราว หากต้องการเปลี่ยนถาวรต้อง Commit ลง GitHub เท่านั้น

---
*Last Updated: 2026-05-10 | Status: Online & Fully Functional*
