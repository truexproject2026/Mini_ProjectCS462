# 🤖 Thai Handwriting ML - Project Instructions (GEMINI.md)

ไฟล์นี้สรุปข้อมูลสำคัญและขั้นตอนการทำงานสำหรับ AI Assistant เพื่อให้สามารถช่วยเหลือและรักษาสภาพแวดล้อมของโปรเจคนี้ได้อย่างต่อเนื่อง

## 🏗️ Project Overview
ระบบทำนายลายมือตัวเลขไทย (๓๖-๔๐) พัฒนาด้วย Next.js (Frontend) และ FastAPI (Backend) โดยใช้ Machine Learning (Random Forest)

## 🛠️ Environmental Setup
- **Root Directory:** `thai-handwriting-next/`
- **Python Version:** 3.14.x
- **Virtual Environment:** `.venv/` (ในโฟลเดอร์ `thai-handwriting-next/`)
- **Backend URL:** ต้องตั้งค่าใน `.env.local` เป็น `http://localhost:8000` สำหรับการรันแบบ Local

## 🚀 Standard Workflow

### 1. การรันระบบ (Local Development)
ต้องเปิดใช้งาน 2 ส่วนพร้อมกันเสมอ:
- **Backend (Python):** 
  ```powershell
  cd thai-handwriting-next
  .\.venv\Scripts\Activate.ps1
  python backend/main.py
  ```
- **Frontend (Next.js):**
  ```powershell
  cd thai-handwriting-next
  npm run dev
  ```

### 2. การเทรนโมเดลใหม่
เมื่อต้องการอัปเดต AI ด้วย Dataset ใหม่:
```powershell
cd thai-handwriting-next
.\.venv\Scripts\Activate.ps1
python train_model.py
```
*หมายเหตุ: หลังเทรนเสร็จ ต้อง Restart Backend เพื่อให้โหลดโมเดลล่าสุด*

## ⚠️ Critical Notes & Troubleshooting
- **Directory Context:** ทุกคำสั่งต้องรันภายในโฟลเดอร์ `thai-handwriting-next/` เท่านั้น
- **Port Conflict:** หากเจอ Error `[Errno 10048]` (Port 8000 ค้าง) ให้ใช้คำสั่ง:
  `netstat -ano | findstr :8000` แล้ว `taskkill /F /PID <PID>`
- **Missing Libraries:** สภาพแวดล้อมนี้ต้องการ `scikit-learn`, `scipy`, `numpy`, `pillow`, `fastapi`, `uvicorn` ซึ่งถูกติดตั้งไว้ใน `.venv` แล้ว
- **BACKEND_URL:** ห้ามเปลี่ยนกลับเป็น URL ของ Render หากต้องการรันในเครื่อง Local เพราะจะทำให้ระบบค้าง

## 📂 Project Structure Reference
- `/backend/main.py`: Logic ของ FastAPI และการ Preprocessing ภาพ
- `/src/app/api/`: Next.js Route Handlers ที่ทำหน้าที่เป็น Proxy ไปหา Python
- `/dataset/`: เก็บรูปภาพแยกตามโฟลเดอร์ตัวเลข
- `/models/`: ที่เก็บไฟล์ `current_model.pkl` และสถิติประสิทธิภาพ

---
*Last Updated: 2026-05-09*
