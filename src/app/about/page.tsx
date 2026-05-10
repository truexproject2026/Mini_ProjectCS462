"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { 
  Code2, 
  Cpu, 
  Layers, 
  Sparkles, 
  Terminal, 
  Users2, 
  BrainCircuit,
  Database,
  Cloud,
  Globe
} from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    { name: "นาย ชินวัตร อ่วมแก้ว", id: "1660701283", role: "Developer" },
    { name: "นาย เดชาธร หุ้มไธสง", id: "1660702463", role: "Developer" },
    { name: "นางสาวศรีรัตน์ อินทลัย", id: "1660705185", role: "Developer" },
    { name: "นางสาวนิชาภา ศรีแจ่มใส", id: "1660706050", role: "Developer" },
    { name: "นางสาวบุญพิทักษ์ โรจนประภาวสุ", id: "1660707538", role: "Developer" }
  ];

  const technologies = [
    { name: "Next.js", icon: <Globe className="text-blue-500" />, desc: "Frontend" },
    { name: "FastAPI", icon: <Terminal className="text-emerald-500" />, desc: "Backend" },
    { name: "Scikit-Learn", icon: <BrainCircuit className="text-orange-500" />, desc: "AI/ML" },
    { name: "Cloudinary", icon: <Cloud className="text-sky-400" />, desc: "Storage" }
  ];

  return (
    <main className="min-h-screen bg-[#f0f2f5] text-slate-900 font-sans pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 pt-12">
        {/* --- Hero Section --- */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-12 mb-12 shadow-2xl group">
          {/* Animated background elements */}
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] group-hover:bg-indigo-500/30 transition-all duration-700"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 bg-purple-600/20 rounded-full blur-[80px] group-hover:bg-purple-500/30 transition-all duration-700"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 text-sm font-bold mb-6 animate-pulse">
              <Sparkles size={16} /> CS462 DATA ANALYTICS PROJECT
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              กลุ่ม <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">RAMNOI</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              ก้าวข้ามขีดจำกัดของการจำแนกลายมือไทยด้วยขุมพลังของ 
              <span className="text-white mx-1 underline decoration-indigo-500 decoration-2 underline-offset-4">ExtraTrees Model</span> 
              ที่ถูกปรับแต่งมาเป็นพิเศษสำหรับตัวเลข ๓๖ - ๔๐
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left Column: Tech Stack --- */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white hover:shadow-indigo-500/5 transition-all">
              <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
                <Cpu className="text-indigo-600" /> Technology Stack
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {technologies.map((tech, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex flex-col items-center text-center hover:scale-105 transition-transform cursor-default">
                    <div className="mb-2">{tech.icon}</div>
                    <div className="text-sm font-bold">{tech.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest">{tech.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Layers size={80} />
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <BrainCircuit /> Core Strategy
              </h3>
              <p className="text-sm text-indigo-100 leading-relaxed">
                เราเลือกใช้ <span className="font-bold text-white">Soft Dilation</span> และ 
                <span className="font-bold text-white mx-1">25x Data Augmentation</span> 
                เพื่อให้โมเดลมีความยืดหยุ่นสูง (Robust) ต่อความเบา/หนักของน้ำหนักปากกาที่ผู้ใช้วาด
              </p>
            </div>
          </div>

          {/* --- Right Column: Team Members --- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-white h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Users2 className="text-pink-500" /> ทีมงาน Ramnoi
                </h3>
                <div className="px-4 py-1 bg-slate-100 rounded-full text-slate-500 text-xs font-bold uppercase tracking-widest">
                  5 Members
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member, i) => (
                  <div key={i} className="group relative bg-slate-50 rounded-2xl p-5 hover:bg-indigo-600 transition-all duration-300 overflow-hidden cursor-default">
                    {/* Background decoration on hover */}
                    <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl scale-0 group-hover:scale-100 transition-transform"></div>
                    
                    <div className="relative z-10 flex flex-col gap-1">
                      <span className="text-indigo-600 font-black text-xs uppercase group-hover:text-indigo-200 transition-colors">
                        Member
                      </span>
                      <span className="text-lg font-bold text-slate-800 group-hover:text-white transition-colors">
                        {member.name}
                      </span>
                      <span className="text-slate-400 font-mono text-sm group-hover:text-indigo-100 transition-colors">
                        {member.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-slate-900 rounded-2xl relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                    <Code2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Project Scope</h4>
                    <p className="text-slate-400 text-xs mt-1">Classification of Thai Digits: ๓๖, ๓๗, ๓๘, ๓๙, ๔๐</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2026 Ramnoi Group &bull; CS462 Data Analytics and Mining &bull; Bangkok University
          </p>
        </div>
      </div>
      
      {/* Inline Tailwind Styles Extension for animations */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </main>
  );
}
