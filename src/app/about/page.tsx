"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { Info, Users, BookOpen, Fingerprint } from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    { name: "นาย ชินวัตร อ่วมแก้ว", id: "1660701283" },
    { name: "นาย เดชาธร หุ้มไธสง", id: "1660702463" },
    { name: "นางสาวศรีรัตน์ อินทลัย", id: "1660705185" },
    { name: "นางสาวนิชาภา ศรีแจ่มใส", id: "1660706050" },
    { name: "นางสาวบุญพิทักษ์ โรจนประภาวสุ", id: "1660707538" }
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Project Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Fingerprint size={120} />
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white">
              <BookOpen size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">เกี่ยวกับโปรเจค</h1>
          </div>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            โปรเจคนี้เป็นส่วนหนึ่งของวิชา <strong>CS462 Data Analytics and Mining</strong> ซึ่งมีเป้าหมายในการพัฒนาโมเดล
            Machine Learning เพื่อจำแนกตัวเลขลายมือภาษาไทย (Thai Handwriting Recognition) โดยเน้นไปที่ชุดตัวเลข 
            <strong> ๓๖, ๓๗, ๓๘, ๓๙, และ ๔๐</strong> 
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-indigo-50 p-6 rounded-2xl">
              <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <Info size={18} /> เทคโนโลยีที่ใช้
              </h3>
              <ul className="text-indigo-700 space-y-1">
                <li>• Frontend: Next.js (TypeScript)</li>
                <li>• Backend: FastAPI (Python)</li>
                <li>• ML: Scikit-learn (ExtraTrees)</li>
                <li>• Storage: Cloudinary</li>
              </ul>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl">
              <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                <Sparkles size={18} /> จุดเด่นของกลุ่มเรา
              </h3>
              <p className="text-emerald-700">
                เราใช้เทคนิค Data Augmentation ถึง 25 เท่า และการประมวลผลภาพแบบ Dilation เพื่อให้ AI 
                สามารถจดจำ "หาง" ของตัวเลข ๓๘ และ ๓๙ ได้อย่างแม่นยำแม้ลายมือจะแตกต่างกัน
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-pink-600 p-3 rounded-2xl text-white">
              <Users size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">สมาชิกกลุ่ม Ramnoi</h2>
              <p className="text-gray-500">คณะเทคโนโลยีสารสนเทศและนวัตกรรม</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-gray-700">{member.name}</span>
                </div>
                <span className="text-indigo-600 font-mono text-sm">{member.id}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-100 text-center text-gray-400 text-sm">
            CS462 Data Analytics and Mining | 2026
          </div>
        </div>
      </div>
    </main>
  );
}

// Reuse lucide icons from home or define locally
const Sparkles = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.912 4.913L19 10l-5.087 2.087L12 17l-1.912-4.913L5 10l5.087-2.087Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);
